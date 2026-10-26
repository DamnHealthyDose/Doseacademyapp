-- Migration A (additive only): columns and indexes the new verify-age and
-- parent-account-action edge functions need. Nothing here removes or restricts anything,
-- so it is safe to apply BEFORE the functions and frontend are deployed, and the old code
-- keeps working against it.
--
-- The destructive half (drop consent_token, consent resets, GRANT/REVOKE/policy changes)
-- lives in supabase/deferred/lock_profile_protected_columns.sql and is applied only after
-- the new functions and frontend are live. See supabase/DEPLOY_CONSENT.md.

-- Tokens are stored as SHA-256 hashes (hex); the raw values only exist in parent emails.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consent_token_hash text,
  ADD COLUMN IF NOT EXISTS parent_manage_token_hash text,
  ADD COLUMN IF NOT EXISTS parent_manage_link_sent_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_consent_token_hash
  ON public.profiles (consent_token_hash) WHERE consent_token_hash IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_parent_manage_token_hash
  ON public.profiles (parent_manage_token_hash) WHERE parent_manage_token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_parent_email
  ON public.profiles (parent_email) WHERE parent_email IS NOT NULL;
