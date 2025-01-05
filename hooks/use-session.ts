import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface UseSessionReturn {
  session: Session | null;
  loading: boolean;
  error: Error | null;
  isAnonymous: boolean;
}

export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createBrowserClient(
    // biome-ignore lint: Forbidden non-null assertion.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint: Forbidden non-null assertion.
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

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
    isAnonymous: session?.user?.is_anonymous || false,
  };
};
