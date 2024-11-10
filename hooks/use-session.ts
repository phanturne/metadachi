import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const fetchSession = async () => {
      try {
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return {
    session,
    setSession,
    loading,
    error,
    isAnonymous:
      session?.user?.aud === "authenticated" && !session?.user?.email,
  };
};
