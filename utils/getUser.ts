import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers'; // Import cookies

interface GetUserServerReturn {
  user: User | null;
  error: Error | null;
  isAnonymous: boolean;
}

export const getUserServer = async (): Promise<GetUserServerReturn> => {
  const cookieStore = await cookies(); // Fetch cookies directly
  const supabase = createServerClient(
    // biome-ignore lint: Forbidden non-null assertion.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint: Forbidden non-null assertion.
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            cookieStore.set(name, value),
          );
        },
      },
    },
  );

  try {
    // Fetch the current user on the server side
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    return {
      user: fetchedUser,
      error: null,
      isAnonymous: fetchedUser?.is_anonymous || false,
    };
  } catch (e) {
    return {
      user: null,
      error: e as Error,
      isAnonymous: false,
    };
  }
};
