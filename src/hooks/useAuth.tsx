import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  date_of_birth: string | null;
  age_verified: boolean;
  age_bracket: string | null;
  parent_email: string | null;
  parent_consent_given: boolean;
  parent_consent_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// If auth hasn't settled by then (stalled request, lock timeout), stop waiting and treat the visitor as signed out.
const AUTH_TIMEOUT_MS = 8000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, date_of_birth, age_verified, age_bracket, parent_email, parent_consent_given, parent_consent_at')
      .eq('user_id', userId)
      .single();
    setProfile(data as Profile | null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // `loading` must never stay true forever. A session that arrives late still updates user/session below.
    const giveUp = setTimeout(() => setLoading(false), AUTH_TIMEOUT_MS);

    // Don't await Supabase calls inside this callback: it runs inside auth-js's lock/initialization,
    // so awaiting fetchProfile (which needs getSession) can deadlock the whole client.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id).catch((err) => console.error('fetchProfile failed', err));
        }, 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id).catch((err) => console.error('fetchProfile failed', err));
        }
      })
      .catch((err) => console.error('getSession failed', err))
      .finally(() => setLoading(false));

    return () => {
      clearTimeout(giveUp);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
