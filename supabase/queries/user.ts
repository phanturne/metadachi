'server only';

import { createClient } from '@/utils/supabase/server';
import type { User } from '@supabase/supabase-js';

export interface GetUserReturn {
  user: User | null;
  error: Error | null;
}

/*
Be careful when protecting pages. The server gets the user session from the cookies, which can be spoofed by anyone.
Always use supabase.auth.getUser() to protect pages and user data.
Never trust supabase.auth.getSession() inside server code such as middleware. It isn't guaranteed to revalidate the Auth token.
It's safe to trust getUser() because it sends a request to the Supabase Auth server every time to revalidate the Auth token."
*/

export const getUser = async (): Promise<GetUserReturn> => {
  const supabase = await createClient();

  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    return {
      user: fetchedUser,
      error: null,
    };
  } catch (e) {
    return {
      user: null,
      error: e as Error,
    };
  }
};
