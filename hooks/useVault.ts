'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { Card } from '@/lib/types';

const DEMO_LOCAL_STORAGE_KEY = 'metadachi-demo-state';

function getDemoState(): Record<string, { pinned?: boolean; favorite?: boolean }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DEMO_LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function updateDemoState(id: string, updates: { pinned?: boolean; favorite?: boolean }) {
  if (typeof window === 'undefined') return;
  const state = getDemoState();
  state[id] = { ...state[id], ...updates };
  localStorage.setItem(DEMO_LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export function useVault() {
  const queryClient = useQueryClient();
  const watcherRef = useRef<boolean>(false);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const { data: cards = [] } = useQuery<Card[]>({
    queryKey: ['vault-cards'],
    queryFn: async () => {
      const res = await fetch('/api/vault');
      const json = await res.json();
      const fetchedCards = json.cards as Card[];

      if (isDemoMode) {
        const demoState = getDemoState();
        return fetchedCards.map(card => {
          const state = demoState[card.id];
          if (state) {
            return {
              ...card,
              pinned: state.pinned ?? card.pinned,
              favorite: state.favorite ?? card.favorite,
            };
          }
          return card;
        });
      }

      return fetchedCards;
    },
    staleTime: 30_000,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['vault-cards'] });
  }, [queryClient]);

  useEffect(() => {
    if (typeof window === 'undefined' || isDemoMode) return;
    
    // Connect to Server-Sent Events stream for true real-time syncing
    const eventSource = new EventSource('/api/vault/stream');
    
    eventSource.onmessage = (e) => {
      if (e.data === 'update') {
        refresh();
      }
    };
    
    return () => {
      eventSource.close();
    };
  }, [refresh, isDemoMode]);

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      if (isDemoMode) {
        updateDemoState(id, { pinned });
        return { success: true, fake: true }; // Resolve immediately
      }

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
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ['vault-cards'] });
      }
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => {
      if (isDemoMode) {
        updateDemoState(id, { favorite });
        return { success: true, fake: true };
      }

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
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ['vault-cards'] });
      }
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
