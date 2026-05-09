'use client'
import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/lib/types'
import { getVaultWriteAdapter } from '@/lib/vaultWriteAdapter'
import { type FamiliarityLevel } from '@/lib/srs'
import { getVaultMode } from '@/lib/vaultMode'

export const FAMILIARITY_LEVELS: FamiliarityLevel[] = ['new', 'learning', 'mastered']

export type Flashcard = Card & {
  front: string
  back: string
  deck: string
  tags: string[]
  difficulty?: string
  category?: string
  familiarity_level: FamiliarityLevel
  last_reviewed_at?: string
}

export interface FlashcardGroup {
  deck: string
  count: number
  flashcards: Flashcard[]
  published?: boolean
}

export interface FlashcardStats {
  total: number
  new: number
  learning: number
  mastered: number
}

const FLASHCARDS_QUERY_PREFIX = ['vault', 'flashcards'] as const

function invalidateFlashcardQueries(qc: ReturnType<typeof useQueryClient>) {
  return qc.invalidateQueries({
    predicate: (query) =>
      Array.isArray(query.queryKey)
      && query.queryKey[0] === FLASHCARDS_QUERY_PREFIX[0]
      && query.queryKey[1] === FLASHCARDS_QUERY_PREFIX[1],
  })
}

function parseFlashcardFromCard(card: Card): Flashcard {
  const rawContent = card.rawContent || '';

  let front = '';
  let back = '';

  // Check for Obsidian SRS Q:/A::: format
  if (rawContent.includes('Q:') && rawContent.includes('A::::')) {
    const qMatch = rawContent.match(/Q:\s*([\s\S]+?)(?=\nA::::)/);
    const aMatch = rawContent.match(/A::::[\s\n]+([\s\S]+)$/);
    front = qMatch?.[1]?.trim() || '';
    back = aMatch?.[1]?.trim() || '';
  } else {
    const parts = rawContent.split('\n---\n');
    const frontRaw = parts[0]?.replace(/^#\s*/, '').trim() || '';
    const backRaw = parts[1]?.trim() || '';
    front = frontRaw || (card.title || '');
    back = backRaw || '';
  }

  const cardData = card as unknown as Record<string, unknown>;

  // Get deck - derive from parent folder if not set in frontmatter
  let deck = 'default';
  if (cardData['deck']) {
    deck = String(cardData['deck']);
  } else if (card.relativePath) {
    const parts = card.relativePath.split('/');
    // If under Flashcards/, use the subfolder (parts[1]) as deck
    if (parts[0] === 'Flashcards' && parts.length >= 3) {
      deck = parts[1];
    } else if (parts.length >= 2) {
      deck = parts[0];
    }
  }

  const difficulty = cardData['difficulty'] as string | undefined;
  const category = cardData['category'] as string | undefined;

  // Parse familiarity_level (default to 'new' if not set)
  const familiarityLevelRaw = cardData['familiarity_level'] as string;
  let familiarity_level: FamiliarityLevel = 'new';
  if (familiarityLevelRaw && FAMILIARITY_LEVELS.includes(familiarityLevelRaw as FamiliarityLevel)) {
    familiarity_level = familiarityLevelRaw as FamiliarityLevel;
  }

  const lastReviewedAt = cardData['last_reviewed_at'] as string | undefined;

  return {
    ...card,
    front,
    back,
    deck,
    difficulty,
    category,
    familiarity_level,
    last_reviewed_at: lastReviewedAt,
  };
}

export function useFlashcards(deck?: string) {
  return useQuery({
    queryKey: [...FLASHCARDS_QUERY_PREFIX, deck],
    queryFn: async (): Promise<Flashcard[]> => {
      const res = await fetch('/api/vault');
      if (!res.ok) throw new Error('Failed to fetch cards');
      const data = await res.json() as { cards?: Card[] };
      const cards = data.cards || [];

      return cards
        .filter(card => card.type === 'flashcard')
        .map(card => parseFlashcardFromCard(card))
        .filter(card => !deck || card.deck === deck);
    },
  });
}

export function useCreateFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      front: string;
      back: string;
      deck?: string;
      tags?: string[];
      difficulty?: string;
      category?: string;
    }) => {
      const mode = getVaultMode();
      const adapter = getVaultWriteAdapter(mode);
      const relativePath = await adapter.createFlashcard(input);
      return relativePath;
    },
    onSuccess: () => {
      invalidateFlashcardQueries(qc);
    },
  });
}

export function useReviewFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      relativePath,
      lastReviewedAt,
    }: {
      id: string;
      relativePath: string;
      lastReviewedAt: string;
    }) => {
      const mode = getVaultMode();
      const adapter = getVaultWriteAdapter(mode);
      await adapter.updateLastReviewed({ id, relativePath, lastReviewedAt });
    },
    onSuccess: () => {
      invalidateFlashcardQueries(qc);
    },
  });
}

export function useUpdateFamiliarityLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      relativePath,
      familiarity_level,
    }: {
      id: string;
      relativePath: string;
      familiarity_level: FamiliarityLevel;
    }) => {
      const mode = getVaultMode();
      const adapter = getVaultWriteAdapter(mode);
      await adapter.updateFamiliarityLevel({ id, relativePath, familiarity_level });
    },
    onSuccess: () => {
      invalidateFlashcardQueries(qc);
    },
  });
}

export function useDeleteFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/vault');
      if (!res.ok) throw new Error('Failed to fetch cards');
      const data = await res.json() as { cards?: Card[] };
      const cards = data.cards || [];
      const card = cards.find(c => c.id === id);
      if (!card) throw new Error('Card not found');

      const mode = getVaultMode();
      const adapter = getVaultWriteAdapter(mode);
      await adapter.removeVaultFile({
        id,
        relativePath: card.relativePath,
      });
    },
    onSuccess: () => {
      invalidateFlashcardQueries(qc);
    },
  });
}

export function useFlashcardsGrouped() {
  const { data: flashcards = [] } = useFlashcards();

  return useMemo(() => {
    const groups = new Map<string, Flashcard[]>();

    for (const card of flashcards) {
      const deck = card.deck || 'default';
      if (!groups.has(deck)) {
        groups.set(deck, []);
      }
      groups.get(deck)!.push(card);
    }

    const result: FlashcardGroup[] = [];
    for (const [deck, cards] of groups) {
      result.push({
        deck,
        count: cards.length,
        flashcards: cards,
        published: false,
      });
    }

    result.sort((a, b) => a.deck.localeCompare(b.deck));

    return result;
  }, [flashcards]);
}

export function useToggleDeckPublished() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ deck, published }: { deck: string; published: boolean }) => {
      const mode = getVaultMode();
      const adapter = getVaultWriteAdapter(mode);
      await adapter.toggleDeckPublished({ deck, published });
    },
    onSuccess: () => {
      invalidateFlashcardQueries(qc);
    },
  });
}

export function useFlashcardStats(): FlashcardStats {
  const { data: flashcards = [] } = useFlashcards();

  return useMemo(() => {
    let newCount = 0;
    let learningCount = 0;
    let masteredCount = 0;

    for (const card of flashcards) {
      switch (card.familiarity_level) {
        case 'new':
          newCount++;
          break;
        case 'learning':
          learningCount++;
          break;
        case 'mastered':
          masteredCount++;
          break;
      }
    }

    return {
      total: flashcards.length,
      new: newCount,
      learning: learningCount,
      mastered: masteredCount,
    };
  }, [flashcards]);
}

export function useFlashcardsByFamiliarity() {
  const { data: flashcards = [] } = useFlashcards();

  return useMemo(() => {
    const buckets: Record<FamiliarityLevel, Flashcard[]> = {
      new: [],
      learning: [],
      mastered: [],
    };

    for (const card of flashcards) {
      buckets[card.familiarity_level].push(card);
    }

    // Sort each bucket by last_reviewed_at (oldest first), nulls at start.
    // This makes "mark reviewed" naturally push a card to the bottom.
    for (const level of FAMILIARITY_LEVELS) {
      buckets[level].sort((a, b) => {
        if (!a.last_reviewed_at && !b.last_reviewed_at) return 0;
        if (!a.last_reviewed_at) return -1;
        if (!b.last_reviewed_at) return 1;
        return new Date(a.last_reviewed_at).getTime() - new Date(b.last_reviewed_at).getTime();
      });
    }

    return buckets;
  }, [flashcards]);
}