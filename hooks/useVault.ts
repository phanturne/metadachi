'use client';

import { Card, VaultConfig } from '@/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { clearDemoOverlay, loadDemoOverlay, saveDemoOverlay } from '@/lib/demoStorage';

const DEMO_LOCAL_STORAGE_KEY = 'metadachi-demo-state';

export const VAULT_CARDS_QUERY_KEY = ['vault-cards'] as const;

export type VaultCardsQueryData = {
  cards: Card[];
  config: VaultConfig | null;
};

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

const EMPTY_VAULT_CONFIG: VaultConfig = { types: [], filterBarOrder: [] };

async function fetchVaultCardsBundle(isDemoMode: boolean): Promise<VaultCardsQueryData> {
  const res = await fetch('/api/vault');
  const json = await res.json();
  let fetchedCards = json.cards as Card[];
  const config = json.config as VaultConfig;

  if (isDemoMode) {
    const demoState = getDemoState();
    fetchedCards = fetchedCards.map(card => {
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
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
      if (isDemoMode) {
        updateDemoState(id, { pinned });
        const overlay = await loadDemoOverlay();
        await saveDemoOverlay({
          ...overlay,
          pinFavoriteById: {
            ...overlay.pinFavoriteById,
            [id]: { ...overlay.pinFavoriteById[id], pinned },
          },
        });
        return { success: true, fake: true };
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
      if (isDemoMode) {
        updateDemoState(id, { favorite });
        const overlay = await loadDemoOverlay();
        await saveDemoOverlay({
          ...overlay,
          pinFavoriteById: {
            ...overlay.pinFavoriteById,
            [id]: { ...overlay.pinFavoriteById[id], favorite },
          },
        });
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

  const togglePin = (id: string, currentPinned: boolean) => {
    togglePinMutation.mutate({ id, pinned: !currentPinned });
  };

  const toggleFavorite = (id: string, currentFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ id, favorite: !currentFavorite });
  };

  const saveVaultFileMutation = useMutation({
    mutationFn: async ({ id, relativePath, raw }: { id: string; relativePath: string; raw: string }) => {
      if (isDemoMode) {
        const overlay = await loadDemoOverlay();
        if (relativePath.startsWith('__demo__/')) {
          const next = {
            ...overlay,
            virtualFiles: overlay.virtualFiles.map(vf =>
              vf.relativePath === relativePath ? { ...vf, raw } : vf
            ),
          };
          await saveDemoOverlay(next);
          return;
        }
        await saveDemoOverlay({
          ...overlay,
          contentByCardId: { ...overlay.contentByCardId, [id]: raw },
        });
        return;
      }

      const res = await fetch('/api/vault/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath, raw }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Failed to save file');
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const addVaultFileMutation = useMutation({
    mutationFn: async () => {
      if (isDemoMode) {
        const overlay = await loadDemoOverlay();
        const noteId = crypto.randomUUID();
        const relativePath = `__demo__/note-${noteId}.md`;
        const raw = `---\nid: ${noteId}\ntitle: New note\ntype: note\n---\n\n# New note\n`;
        await saveDemoOverlay({
          ...overlay,
          virtualFiles: [...overlay.virtualFiles, { relativePath, raw }],
        });
        return relativePath;
      }

      const res = await fetch('/api/vault/file', { method: 'POST' });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Failed to create file');
      }
      const json = (await res.json()) as { relativePath?: string };
      if (!json.relativePath) throw new Error('Invalid create response');
      return json.relativePath;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const removeVaultFileMutation = useMutation({
    mutationFn: async ({ id, relativePath }: { id: string; relativePath: string }) => {
      if (isDemoMode) {
        const overlay = await loadDemoOverlay();
        if (relativePath.startsWith('__demo__/')) {
          await saveDemoOverlay({
            ...overlay,
            virtualFiles: overlay.virtualFiles.filter(vf => vf.relativePath !== relativePath),
          });
          return;
        }
        await saveDemoOverlay({
          ...overlay,
          tombstonedIds: [...new Set([...overlay.tombstonedIds, id])],
        });
        return;
      }

      const qs = new URLSearchParams({ relativePath });
      const res = await fetch(`/api/vault/file?${qs}`, { method: 'DELETE' });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Failed to delete file');
      }
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
      if (isDemoMode) {
        const overlay = await loadDemoOverlay();
        if (fromRelativePath.startsWith('__demo__/')) {
          const idx = overlay.virtualFiles.findIndex(vf => vf.relativePath === fromRelativePath);
          if (idx === -1) throw new Error('Virtual file not found');
          const nextVf = [...overlay.virtualFiles];
          nextVf[idx] = { ...nextVf[idx]!, relativePath: toRelativePath };
          await saveDemoOverlay({ ...overlay, virtualFiles: nextVf });
          return;
        }
        await saveDemoOverlay({
          ...overlay,
          renamedByCardId: { ...overlay.renamedByCardId, [id]: toRelativePath },
        });
        return;
      }

      const res = await fetch('/api/vault/file', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromRelativePath, toRelativePath }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Failed to rename or move file');
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_CARDS_QUERY_KEY });
    },
  });

  const saveVaultFileAsync = (id: string, relativePath: string, raw: string) =>
    saveVaultFileMutation.mutateAsync({ id, relativePath, raw });

  const addVaultFile = () => {
    addVaultFileMutation.mutate();
  };

  const removeVaultFile = (id: string, relativePath: string) => {
    removeVaultFileMutation.mutate({ id, relativePath });
  };

  const relocateVaultFileAsync = (id: string, fromRelativePath: string, toRelativePath: string) =>
    relocateVaultFileMutation.mutateAsync({ id, fromRelativePath, toRelativePath });

  const resetDemoOverlay = async () => {
    await clearDemoOverlay();
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
    isDemoMode,
    isVaultPending,
    refresh,
    togglePin,
    toggleFavorite,
    saveVaultFileAsync,
    addVaultFile,
    removeVaultFile,
    relocateVaultFileAsync,
    resetDemoOverlay,
    vaultFileBusy,
  };
}
