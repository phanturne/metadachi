'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { Card } from '@/lib/types';

export function useVault() {
  const queryClient = useQueryClient();
  const watcherRef = useRef<boolean>(false);

  const { data: cards = [] } = useQuery<Card[]>({
    queryKey: ['vault-cards'],
    queryFn: async () => {
      const res = await fetch('/api/vault');
      const json = await res.json();
      return json.cards as Card[];
    },
    staleTime: 30_000,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['vault-cards'] });
  }, [queryClient]);

  // Simple polling fallback — file watching requires a separate mechanism
  // For now, poll every 10s as a lightweight refresh strategy
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { cards, refresh };
}
