-- Lock down public.profiles so a signed-in user cannot grant themselves parental
-- consent or change their age fields. Protected columns can only be written by the
-- service role (edge functions: verify-age, parent-account-action).
--
-- Approach: column-level privileges. RLS still scopes rows to the owner; these grants
-- scope which columns the browser (anon/authenticated) can touch at all.

-- ---------------------------------------------------------------------------
-- 1. Token storage: hashes only.
-- The raw consent token and the parent's dashboard ("manage") token only ever exist in
-- the emails sent to the parent. The database keeps SHA-256 hashes (hex) and the edge
-- functions look tokens up by hash. The old plaintext consent_token column is dropped,
-- which also invalidates every outstanding consent link (they were created by the
-- browser, so they cannot be trusted either).
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consent_token_hash text,
  ADD COLUMN IF NOT EXISTS parent_manage_token_hash text,
  ADD COLUMN IF NOT EXISTS parent_manage_link_sent_at timestamptz;

DROP INDEX IF EXISTS public.idx_profiles_consent_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS consent_token;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_consent_token_hash
  ON public.profiles (consent_token_hash) WHERE consent_token_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_parent_manage_token_hash
  ON public.profiles (parent_manage_token_hash) WHERE parent_manage_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_parent_email
  ON public.profiles (parent_email) WHERE parent_email IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Reset existing consents.
-- Before this migration the browser could write parent_consent_given / age_verified
-- directly, and the consent token was generated in the browser, so a child could approve
-- themselves. Any consent recorded for a 13-15 (or unknown-bracket) profile therefore
-- cannot be trusted. Reset them; the child has to go through the server-side flow
-- (verify-age) again so the parent actually receives and approves a request.
-- 16+ profiles are untouched: they never needed consent.
-- ---------------------------------------------------------------------------
UPDATE public.profiles
SET parent_consent_given = false,
    parent_consent_at = NULL,
    age_verified = false,
    consent_token_hash = NULL,
    parent_manage_token_hash = NULL,
    parent_manage_link_sent_at = NULL
WHERE parent_consent_given = true
  AND (age_bracket = '13-15' OR age_bracket IS NULL);

-- Every raw token was just dropped, so any remaining expiry timestamps are meaningless.
UPDATE public.profiles SET consent_token_expires_at = NULL WHERE consent_token_expires_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 3. Column-level privileges.
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
