'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const res = await fetch('/api/vault/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned }),
      });
      if (!res.ok) throw new Error('Failed to toggle pin');
      return res.json();
    },
    onMutate: async ({ id, pinned }) => {
      await queryClient.cancelQueries({ queryKey: ['vault-cards'] });
      const previousCards = queryClient.getQueryData<Card[]>(['vault-cards']);
      
      queryClient.setQueryData<Card[]>(['vault-cards'], (old) => {
        if (!old) return old;
        return old.map(card => card.id === id ? { ...card, pinned } : card);
      });
      
      return { previousCards };
    },
    onError: (err, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(['vault-cards'], context.previousCards);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-cards'] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => {
      const res = await fetch('/api/vault/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, favorite }),
      });
      if (!res.ok) throw new Error('Failed to toggle favorite');
      return res.json();
    },
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: ['vault-cards'] });
      const previousCards = queryClient.getQueryData<Card[]>(['vault-cards']);
      
      queryClient.setQueryData<Card[]>(['vault-cards'], (old) => {
        if (!old) return old;
        return old.map(card => card.id === id ? { ...card, favorite } : card);
      });
      
      return { previousCards };
    },
    onError: (err, variables, context) => {
      if (context?.previousCards) {
        queryClient.setQueryData(['vault-cards'], context.previousCards);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vault-cards'] });
    },
  });

  const togglePin = (id: string, currentPinned: boolean) => {
    togglePinMutation.mutate({ id, pinned: !currentPinned });
  };

  const toggleFavorite = (id: string, currentFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ id, favorite: !currentFavorite });
  };

  return { cards, refresh, togglePin, toggleFavorite };
}
