import { useSession } from '@/hooks/use-session';
import type { Profile } from '@/supabase/queries/user';
import useSWR from 'swr';

export function useProfile() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useSWR<Profile>(
    userId ? `/api/profile` : null,
    async () => {
      const res = await fetch(`/api/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );
}
