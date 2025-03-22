import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface UseSessionReturn {
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Fetch the current session when the component mounts
        const {
          data: { session: fetchedSession },
        } = await supabase.auth.getSession();
        setSession(fetchedSession);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for changes to the auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession ?? null);
      },
    );

    // Cleanup the listener on unmount
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return {
    session,
    loading,
    error,
  };
};
