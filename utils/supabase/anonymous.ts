import { createClient } from '@/utils/supabase/client';

/**
 * Checks if a user is signed in. If not, signs in anonymously.
 * Returns { isGuest, error }.
 * Usage: const { isGuest, error } = await signInAnonymouslyIfNeeded(supabase)
 */
export async function signInAnonymouslyIfNeeded(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      return { isGuest: false, error };
    }
    return { isGuest: true };
  }
  return { isGuest: false };
}
