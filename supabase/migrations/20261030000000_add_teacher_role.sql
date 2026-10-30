-- Add the 'teacher' value to the app_role enum.
--
-- This is isolated in its own migration on purpose: Postgres does not allow a
-- newly added enum value to be referenced in the SAME transaction that adds it.
-- The policies that reference 'teacher' live in the next migration, which runs
-- in a later transaction once this value is committed.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
