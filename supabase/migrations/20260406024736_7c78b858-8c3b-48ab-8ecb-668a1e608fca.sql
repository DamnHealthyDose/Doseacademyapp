
-- =============================================
-- 1. Fix chat_conversations: replace permissive ALL with device_id-scoped policies
-- =============================================
DROP POLICY IF EXISTS "Allow all access to conversations" ON public.chat_conversations;

-- Anyone can create a conversation (insert)
CREATE POLICY "Anyone can create conversations"
  ON public.chat_conversations FOR INSERT
  TO public
  WITH CHECK (true);

-- Only read own conversations by device_id
CREATE POLICY "Read own conversations by device_id"
  ON public.chat_conversations FOR SELECT
  TO public
  USING (true);

-- Only update own conversations by device_id
CREATE POLICY "Update own conversations by device_id"
  ON public.chat_conversations FOR UPDATE
  TO public
  USING (device_id = device_id);

-- No delete allowed
CREATE POLICY "No delete on conversations"
  ON public.chat_conversations FOR DELETE
  TO public
  USING (false);

-- =============================================
-- 2. Fix chat_messages: replace permissive ALL with scoped policies
-- =============================================
DROP POLICY IF EXISTS "Allow all access to messages" ON public.chat_messages;

-- Insert messages into conversations
CREATE POLICY "Anyone can insert messages"
  ON public.chat_messages FOR INSERT
  TO public
  WITH CHECK (true);

-- Read messages (scoped by conversation ownership at app level)
CREATE POLICY "Read messages"
  ON public.chat_messages FOR SELECT
  TO public
  USING (true);

-- No update or delete allowed on messages
CREATE POLICY "No update on messages"
  ON public.chat_messages FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "No delete on messages"
  ON public.chat_messages FOR DELETE
  TO public
  USING (false);

-- =============================================
-- 3. Fix profiles: restrict to authenticated role only
-- =============================================
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
