'use client';

import { BentoGrid } from '@/components/BentoGrid';
import { CardModal } from '@/components/CardModal';
import { DemoBadge } from '@/components/DemoBadge';
import { PolymorphicCard } from '@/components/cards';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VaultMarkdownWorkspace } from '@/components/VaultMarkdownWorkspace';
import { InboxHomeSection } from '@/components/InboxHomeSection';
import { useVault } from '@/hooks/useVault';
import { cardIsInbox } from '@/lib/inbox';
import { cn } from '@/lib/utils';
import { CardType } from '@/lib/types';
import { useEffect, useMemo, useState } from 'react';

const VIEW_STORAGE_KEY = 'metadachi-vault-view';

type VaultViewMode = 'cards' | 'tree';

function readStoredView(): VaultViewMode {
  if (typeof window === 'undefined') return 'cards';
  try {
    const v = localStorage.getItem(VIEW_STORAGE_KEY);
    if (v === 'tree' || v === 'cards') return v;
  } catch {
    /* ignore */
  }
  return 'cards';
}

export function ClientVault() {
  const { cards, config, isVaultPending } = useVault();
  const [viewMode, setViewMode] = useState<VaultViewMode>('cards');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CardType | 'all'>('all');
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const selectedCard = useMemo(
    () => cards.find(c => c.filePath === selectedFilePath) || null,
    [cards, selectedFilePath]
  );

  const galleryPool = useMemo(() => cards.filter(c => !cardIsInbox(c)), [cards]);

  const inboxCards = useMemo(() => cards.filter(cardIsInbox), [cards]);

  const filtered = useMemo(() => {
    return galleryPool.filter(card => {
      const matchesType = typeFilter === 'all' || card.type === typeFilter;
      const matchesQuery = !query ||
        card.title.toLowerCase().includes(query.toLowerCase()) ||
        card.rawContent.toLowerCase().includes(query.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [galleryPool, typeFilter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: galleryPool.length };
    for (const card of galleryPool) {
      c[card.type] = (c[card.type] ?? 0) + 1;
    }
    return c;
  }, [galleryPool]);

  const pinned = useMemo(() => filtered.filter(c => c.pinned && !c.favorite), [filtered]);
  const favorite = useMemo(() => filtered.filter(c => c.favorite), [filtered]);
  const rest = useMemo(() => filtered.filter(c => !c.pinned && !c.favorite), [filtered]);

  useEffect(() => {
    setViewMode(readStoredView());
  }, []);

  const persistViewMode = (mode: VaultViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Metadachi</h1>
          <DemoBadge />
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-4 mb-8">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar
          selected={typeFilter}
          onSelect={setTypeFilter}
          counts={counts}
          config={config}
          vaultReady={!isVaultPending}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="vault-view-cards"
            aria-pressed={viewMode === 'cards'}
            onClick={() => persistViewMode('cards')}
            className={cn(
              'rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'cards' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            Cards
          </button>
          <button
            type="button"
            data-testid="vault-view-tree"
            aria-pressed={viewMode === 'tree'}
            onClick={() => persistViewMode('tree')}
            className={cn(
              'rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'tree' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted/50'
            )}
          >
            Tree
          </button>
        </div>
      </div>

      {viewMode === 'tree' ? (
        <VaultMarkdownWorkspace cards={filtered} />
      ) : (
        <>
      {typeFilter === 'all' && <InboxHomeSection inboxCards={inboxCards} />}

      {favorite.length > 0 && (
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            ❤️ Favorites
          </h2>
          <BentoGrid>
            {favorite.map(card => (
              <div key={card.filePath} onClick={() => setSelectedFilePath(card.filePath)} style={{ cursor: 'pointer' }}>
                <PolymorphicCard card={card} />
              </div>
            ))}
          </BentoGrid>
        </section>
      )}

      {pinned.length > 0 && (
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            📌 Pinned
          </h2>
          <BentoGrid>
            {pinned.map(card => (
              <div key={card.filePath} onClick={() => setSelectedFilePath(card.filePath)} style={{ cursor: 'pointer' }}>
                <PolymorphicCard card={card} />
              </div>
            ))}
          </BentoGrid>
        </section>
      )}

      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          {typeFilter === 'all' ? 'All Cards' : `${typeFilter} Cards`}
          <span className="bg-secondary text-secondary-foreground text-[0.65rem] px-2 py-0.5 rounded-full font-normal">
            {filtered.length}
          </span>
        </h2>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm border hover:border-foreground/20 transition-colors border-dashed border-border rounded-xl">
            {cards.length === 0
              ? 'No cards yet. Add markdown files to your vault to get started.'
              : query || typeFilter !== 'all'
                ? 'No cards match your search.'
                : galleryPool.length === 0 && inboxCards.length > 0
                  ? 'Nothing else in the vault yet — open the Inbox to triage captures.'
                  : 'No cards match your search.'}
          </div>
        ) : (
          <BentoGrid>
            {rest.map(card => (
              <div key={card.filePath} onClick={() => setSelectedFilePath(card.filePath)} style={{ cursor: 'pointer' }}>
                <PolymorphicCard card={card} />
              </div>
            ))}
          </BentoGrid>
        )}
      </section>

      <CardModal card={selectedCard} onClose={() => setSelectedFilePath(null)} />
        </>
      )}
    </div>
  );
}
