import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Shared sign-out handler used by every nav surface (Sidebar, BottomNav,
 * MobileMenu, TeacherDashboard).
 *
 * Signs out of Supabase, then does a full-page redirect to /auth. The hard
 * reload wipes AppContext's in-memory state and the React Query cache, so no
 * manual cache clearing is needed.
 *
 * NOTE: SPARK/WAVE/RSD/Squad progress (dose-academy-state, dose-wave-*,
 * dose-rsd-stats, dose-squad-stats) lives ONLY in localStorage — there is no
 * server-side copy — so it is intentionally preserved. Clearing it would
 * permanently erase the student's history.
 */
export const useSignOut = () => {
  const { signOut } = useAuth();

  return useCallback(async () => {
    try {
      await signOut();
    } finally {
      // Runs even if the Supabase call fails, so the user is never stranded
      // in a half-signed-out state. Full reload drops in-memory app state.
      window.location.replace('/auth');
    }
  }, [signOut]);
};
