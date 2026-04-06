
-- 1. Fix profiles UPDATE policy: add WITH CHECK to prevent user_id reassignment
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
CREATE POLICY "Authenticated users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. Fix chat_conversations UPDATE: replace tautological device_id = device_id with false
-- Updates to conversations are only cosmetic (updated_at), move to edge function if needed
DROP POLICY IF EXISTS "Update own conversations by device_id" ON public.chat_conversations;
CREATE POLICY "No update on conversations"
  ON public.chat_conversations FOR UPDATE
  TO public
  USING (false);
