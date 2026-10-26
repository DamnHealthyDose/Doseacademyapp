-- Migration B (destructive): lock down public.profiles so a signed-in user cannot grant
-- themselves parental consent or change their age fields. Protected columns can only be
-- written by the service role (edge functions: verify-age, parent-account-action).
--
-- DO NOT APPLY UNTIL Migration A (20261021000000_add_consent_token_hash_columns.sql) is
-- applied AND the new edge functions AND the new frontend are deployed and tested.
-- It lives outside supabase/migrations/ on purpose so `supabase db push` can't apply it by
-- accident. To apply: move it into supabase/migrations/ with a timestamp later than A
-- (e.g. 20261021000001_lock_profile_protected_columns.sql) or paste it into the SQL editor.
-- See supabase/DEPLOY_CONSENT.md.
--
-- Approach: column-level privileges. RLS still scopes rows to the owner; these grants
-- scope which columns the browser (anon/authenticated) can touch at all.

-- ---------------------------------------------------------------------------
-- 1. Drop the plaintext consent token.
-- The old consent_token column was generated in the browser. Dropping it invalidates every
-- outstanding consent link (they cannot be trusted either). The new flow uses
-- consent_token_hash, added in Migration A.
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS public.idx_profiles_consent_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS consent_token;

-- ---------------------------------------------------------------------------
-- 2. Reset existing consents / verifications.
-- Until this migration the browser could write parent_consent_given, age_verified,
-- age_bracket and the consent token directly, so a child could have set any of these on
-- themselves. None of the following states can be trusted, so each is reset and the user
-- has to go through the server-side flow (verify-age) again:
--   a) parent_consent_given = true for a 13-15 or unknown-bracket profile
--   b) age_bracket = '13-15' and age_verified = true, regardless of parent_consent_given
--      (age_verified could have been set without any consent at all)
--   c) age_bracket IS NULL and age_verified = true (verified with no bracket on record)
-- 16+ profiles are untouched: they never needed consent. under-13 profiles are untouched
-- (they are never verified).
-- ---------------------------------------------------------------------------
UPDATE public.profiles
SET parent_consent_given = false,
    parent_consent_at = NULL,
    age_verified = false,
    consent_token_hash = NULL,
    consent_token_expires_at = NULL,
    parent_manage_token_hash = NULL,
    parent_manage_link_sent_at = NULL
WHERE (parent_consent_given = true AND (age_bracket = '13-15' OR age_bracket IS NULL))
   OR (age_bracket = '13-15' AND age_verified = true)
   OR (age_bracket IS NULL AND age_verified = true);

-- Every raw token was just dropped, so any remaining expiry timestamps are meaningless.
UPDATE public.profiles SET consent_token_expires_at = NULL WHERE consent_token_expires_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Cascade child data when an auth user is deleted.
-- barkley_memory.student_id and ignite_streaks.user_id were never foreign keys, so deleting
-- a user left their rows behind. parent-account-action also deletes these explicitly; the
-- FKs are the backstop for any other deletion path (dashboard, admin API).
-- Orphans must go first or the constraint can't be created.
-- ---------------------------------------------------------------------------
DELETE FROM public.barkley_memory WHERE student_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.ignite_streaks WHERE user_id NOT IN (SELECT id FROM auth.users);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'barkley_memory_student_id_fkey') THEN
    ALTER TABLE public.barkley_memory
      ADD CONSTRAINT barkley_memory_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ignite_streaks_user_id_fkey') THEN
    ALTER TABLE public.ignite_streaks
      ADD CONSTRAINT ignite_streaks_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_barkley_memory_student_id ON public.barkley_memory (student_id);

-- ---------------------------------------------------------------------------
-- 4. Column-level privileges.
-- ---------------------------------------------------------------------------
-- A profile row is created by the handle_new_user trigger; the browser never inserts one.
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;

REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Browser may read everything except the token hash columns.
GRANT SELECT (
  id, user_id, display_name, date_of_birth, age_verified, age_bracket,
  parent_email, parent_consent_given, parent_consent_at, created_at, updated_at
) ON public.profiles TO authenticated;

-- Browser may only edit harmless fields. Everything else goes through edge functions.
GRANT UPDATE (display_name) ON public.profiles TO authenticated;

-- Note: columns added to profiles later are NOT visible/editable from the browser
-- until explicitly granted above. That is the intended safe default.
