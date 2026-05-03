'use client';

import { Card, VaultConfig } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { getVaultCapabilities, getVaultMode } from '@/lib/vaultMode';
import { getVaultWriteAdapter } from '@/lib/vaultWriteAdapter';

export const VAULT_CARDS_QUERY_KEY = ['vault-cards'] as const;

export type VaultCardsQueryData = {
  cards: Card[];
  config: VaultConfig | null;
};

const EMPTY_VAULT_CONFIG: VaultConfig = { types: [], filterBarOrder: [] };

async function fetchVaultCardsBundle(isDemoMode: boolean): Promise<VaultCardsQueryData> {
  const res = await fetch('/api/vault');
  const json = await res.json();
  let fetchedCards = json.cards as Card[];
  const config = json.config as VaultConfig;

  if (isDemoMode) {
    if (typeof window !== 'undefined') {
      const { loadDemoOverlay } = await import('@/lib/demoStorage');
      const { mergeDemoOverlay } = await import('@/lib/mergeDemoOverlay');
      const overlay = await loadDemoOverlay();
      fetchedCards = mergeDemoOverlay(fetchedCards, overlay, config ?? EMPTY_VAULT_CONFIG);
    }
  }

  return { cards: fetchedCards, config };
}

/** Shared options so every `useQuery` for vault shares one cache entry and one network fetch. */
export function vaultCardsQueryOptions(isDemoMode: boolean) {
  return {
    queryKey: VAULT_CARDS_QUERY_KEY,
    queryFn: () => fetchVaultCardsBundle(isDemoMode),
    staleTime: 30_000,
    refetchOnWindowFocus: false as const,
  };
}

/** Single EventSource — must not live in `useVault()` (many components call that hook). */
const vaultSse = {
  instance: null as EventSource | null,
  debounce: null as ReturnType<typeof setTimeout> | null,
};

const vaultSseRefreshRef = { current: () => {} };

function openVaultSse() {
  if (typeof window === 'undefined' || vaultSse.instance) return;

  const eventSource = new EventSource('/api/vault/stream');
  vaultSse.instance = eventSource;

  eventSource.onmessage = (e) => {
    if (e.data !== 'update') return;
    if (vaultSse.debounce) clearTimeout(vaultSse.debounce);
    vaultSse.debounce = setTimeout(() => {
      vaultSse.debounce = null;
      vaultSseRefreshRef.current();
    }, 350);
  };
}

function closeVaultSse() {
  if (vaultSse.debounce) {
    clearTimeout(vaultSse.debounce);
    vaultSse.debounce = null;
  }
  if (vaultSse.instance) {
    vaultSse.instance.close();
    vaultSse.instance = null;
  }
}

/**
 * Mount once under `QueryClientProvider`. Keeps exactly one SSE connection regardless of how many
 * components call `useVault()` (grid, each card, modal, markdown workspace, …).
 */
export function VaultSseBridge() {
  const queryClient = useQueryClient();
  const mode = getVaultMode();
  const isDemoMode = mode === 'demo';

  const { isSuccess: isVaultQuerySuccess } = useQuery<VaultCardsQueryData>(vaultCardsQueryOptions(isDemoMode));

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
  }, [queryClient]);

  vaultSseRefreshRef.current = refresh;

  useEffect(() => {
    if (typeof window === 'undefined' || isDemoMode || !isVaultQuerySuccess) return;

    openVaultSse();
    return () => closeVaultSse();
  }, [isDemoMode, isVaultQuerySuccess]);

  return null;
}

export function useVault() {
  const queryClient = useQueryClient();
  const mode = getVaultMode();
  const isDemoMode = mode === 'demo';
  const capabilities = getVaultCapabilities(mode);
  const writeAdapter = getVaultWriteAdapter(mode);

  const {
    data = { cards: [], config: null },
    isPending: isVaultPending,
  } = useQuery<VaultCardsQueryData>(vaultCardsQueryOptions(isDemoMode));

  const cards = data.cards;
  const config = data.config;

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
  }, [queryClient]);

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      await writeAdapter.togglePin({ id, pinned });
    },
    onMutate: async ({ id, pinned }) => {
      await queryClient.cancelQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
      const previous = queryClient.getQueryData<VaultCardsQueryData>(VAULT_CARDS_QUERY_KEY);

      queryClient.setQueryData<VaultCardsQueryData>(VAULT_CARDS_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards.map(card => (card.id === id ? { ...card, pinned } : card)),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(VAULT_CARDS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
      }
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, favorite }: { id: string; favorite: boolean }) => {
      await writeAdapter.toggleFavorite({ id, favorite });
    },
    onMutate: async ({ id, favorite }) => {
      await queryClient.cancelQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
      const previous = queryClient.getQueryData<VaultCardsQueryData>(VAULT_CARDS_QUERY_KEY);

      queryClient.setQueryData<VaultCardsQueryData>(VAULT_CARDS_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards.map(card => (card.id === id ? { ...card, favorite } : card)),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(VAULT_CARDS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
      }
    },
  });

  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      await writeAdapter.togglePublished({ id, published });
    },
    onMutate: async ({ id, published }) => {
      await queryClient.cancelQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
      const previous = queryClient.getQueryData<VaultCardsQueryData>(VAULT_CARDS_QUERY_KEY);

      queryClient.setQueryData<VaultCardsQueryData>(VAULT_CARDS_QUERY_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          cards: old.cards.map(card => (card.id === id ? { ...card, published } : card)),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(VAULT_CARDS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
      }
    },
  });

  const togglePin = (id: string, currentPinned: boolean) => {
    togglePinMutation.mutate({ id, pinned: !currentPinned });
  };

  const toggleFavorite = (id: string, currentFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ id, favorite: !currentFavorite });
  };

  const togglePublished = (id: string, currentPublished: boolean) => {
    togglePublishedMutation.mutate({ id, published: !currentPublished });
  };

  const saveVaultFileMutation = useMutation({
    mutationFn: async ({ id, relativePath, raw }: { id: string; relativePath: string; raw: string }) => {
      await writeAdapter.saveVaultFile({ id, relativePath, raw });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const addVaultFileMutation = useMutation({
    mutationFn: async () => writeAdapter.addVaultFile(),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const removeVaultFileMutation = useMutation({
    mutationFn: async ({ id, relativePath }: { id: string; relativePath: string }) => {
      await writeAdapter.removeVaultFile({ id, relativePath });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const relocateVaultFileMutation = useMutation({
    mutationFn: async ({
      id,
      fromRelativePath,
      toRelativePath,
    }: {
      id: string;
      fromRelativePath: string;
      toRelativePath: string;
    }) => {
      await writeAdapter.relocateVaultFile({ id, fromRelativePath, toRelativePath });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const saveVaultFileAsync = (id: string, relativePath: string, raw: string) =>
    saveVaultFileMutation.mutateAsync({ id, relativePath, raw });

  const saveVaultConfigMutation = useMutation({
    mutationFn: async (newConfig: VaultConfig) => {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (!res.ok) throw new Error('Failed to save config');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const saveVaultConfig = (newConfig: VaultConfig) => 
    saveVaultConfigMutation.mutate(newConfig);

  const addVaultFile = () => {
    addVaultFileMutation.mutate();
  };

  const importCommunityCardMutation = useMutation({
    mutationFn: async (card: Card) => {
      const res = await fetch('/api/vault/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw: `---\nid: ${card.id}\ntitle: ${card.title}\ntype: ${card.type}\nsource: community\ninbox: true\n---\n\n${card.rawContent}`
        }),
      });
      if (!res.ok) throw new Error('Failed to import card');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const importCommunityCard = (card: Card) => 
    importCommunityCardMutation.mutate(card);

  const removeVaultFile = (id: string, relativePath: string) => {
    removeVaultFileMutation.mutate({ id, relativePath });
  };

  const relocateVaultFileAsync = (id: string, fromRelativePath: string, toRelativePath: string) =>
    relocateVaultFileMutation.mutateAsync({ id, fromRelativePath, toRelativePath });

  const resetDemoOverlay = async () => {
    if (!capabilities.canResetOverlay) return;
    await writeAdapter.resetDemoOverlay();
    await queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
  };

  const vaultFileBusy =
    saveVaultFileMutation.isPending ||
    addVaultFileMutation.isPending ||
    removeVaultFileMutation.isPending ||
    relocateVaultFileMutation.isPending;

  return {
    cards,
    /** Same as `cards`; alias for editors that also take a filtered `cards` prop. */
    allCards: cards,
    config,
    mode,
    capabilities,
    isDemoMode,
    isVaultPending,
    refresh,
    togglePin,
    toggleFavorite,
    togglePublished,
    saveVaultFileAsync,
    saveVaultConfig,
    importCommunityCard,
    addVaultFile,
    removeVaultFile,
    relocateVaultFileAsync,
    resetDemoOverlay,
    vaultFileBusy,
  };
}
