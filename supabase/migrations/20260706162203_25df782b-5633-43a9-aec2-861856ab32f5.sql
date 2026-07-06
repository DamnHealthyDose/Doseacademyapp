
-- 1. Lock down chat tables: move all access behind edge functions (service_role)
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Read own conversations by device_id" ON public.chat_conversations;
DROP POLICY IF EXISTS "No update on conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "No delete on conversations" ON public.chat_conversations;

DROP POLICY IF EXISTS "Anyone can insert messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Read messages" ON public.chat_messages;
DROP POLICY IF EXISTS "No update on messages" ON public.chat_messages;
DROP POLICY IF EXISTS "No delete on messages" ON public.chat_messages;

REVOKE ALL ON public.chat_conversations FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.chat_messages FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.chat_conversations TO service_role;
GRANT ALL ON public.chat_messages TO service_role;

-- Deny-all policies for anon/authenticated (RLS remains enabled; service_role bypasses)
CREATE POLICY "Service role only - conversations" ON public.chat_conversations
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "Service role only - messages" ON public.chat_messages
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- 2. user_roles: replace "true" INSERT policy with admin-only management
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' LOOP
    EXECUTE format('DROP POLICY %I ON public.user_roles', p.policyname);
  END LOOP;
END$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Restrict SECURITY DEFINER function execution
-- Trigger-only functions: revoke from everyone except service_role/owner
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.minimize_dob() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies for authenticated users; keep that grant, revoke from anon/public
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
