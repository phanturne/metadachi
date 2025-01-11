import type { User } from '@supabase/supabase-js';
import { createClient } from '../../utils/supabase/server';
import type { Database } from '../types';

export type Profile = Database['public']['Tables']['profile']['Row'];
export interface GetUserReturn {
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

export async function getProfileByUserId({ id }: { id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('user_id', id)
    .single();

  if (error) {
    console.error('Failed to get profile by user id from database', error);
    throw error;
  }

  return data;
}
