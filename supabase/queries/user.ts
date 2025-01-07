import type { User } from '@supabase/supabase-js';
import { createClient } from '../../utils/supabase/server';

interface GetUserReturn {
  user: User | null;
  error: Error | null;
  isAnonymous: boolean;
}

export const getUser = async (): Promise<GetUserReturn> => {
  const supabase = await createClient();

  try {
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
