
-- Add age_bracket enum
CREATE TYPE public.age_bracket AS ENUM ('under-13', '13-15', '16+');

-- Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN age_bracket public.age_bracket,
  ADD COLUMN consent_token uuid,
  ADD COLUMN consent_token_expires_at timestamptz;

-- Create index on consent_token for lookups
CREATE INDEX idx_profiles_consent_token ON public.profiles (consent_token) WHERE consent_token IS NOT NULL;

-- Function to minimize DOB: sets age_bracket and clears raw DOB
CREATE OR REPLACE FUNCTION public.minimize_dob()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When age_verified is set to true and date_of_birth exists, compute bracket and clear DOB
  IF NEW.age_verified = true AND NEW.date_of_birth IS NOT NULL AND (OLD.age_verified IS DISTINCT FROM true) THEN
    NEW.date_of_birth := NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-minimize DOB on verification
CREATE TRIGGER minimize_dob_on_verify
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.minimize_dob();
