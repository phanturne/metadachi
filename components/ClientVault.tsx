'use client';

import { BentoGrid } from '@/components/BentoGrid';
import { CardModal } from '@/components/CardModal';
import { PolymorphicCard } from '@/components/cards';
import { DemoBadge } from '@/components/DemoBadge';
import { FilterBar } from '@/components/FilterBar';
import { InboxHomeSection } from '@/components/InboxHomeSection';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VaultMarkdownWorkspace } from '@/components/VaultMarkdownWorkspace';
import { useVault } from '@/hooks/useVault';
import { cardIsInbox } from '@/lib/inbox';
import { CardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { FolderTree, LayoutGrid } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const VIEW_STORAGE_KEY = 'metadachi-vault-view';
const GRID_COLUMNS_STORAGE_KEY = 'metadachi-grid-columns';

type VaultViewMode = 'cards' | 'tree';
type GridColumns = 2 | 3 | 4 | 5;

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

function readStoredGridColumns(): GridColumns {
  if (typeof window === 'undefined') return 3;
  try {
    const v = Number(localStorage.getItem(GRID_COLUMNS_STORAGE_KEY));
    if (v === 2 || v === 3 || v === 4 || v === 5) return v;
  } catch {
    /* ignore */
  }
  return 3;
}

export function ClientVault() {
  const { cards, config, isVaultPending } = useVault();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [viewMode, setViewMode] = useState<VaultViewMode>('cards');
  const [gridColumns, setGridColumns] = useState<GridColumns>(3);
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
    setGridColumns(readStoredGridColumns());
    setHasHydrated(true);
  }, []);

  const persistViewMode = (mode: VaultViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  };

  const persistGridColumns = (columns: GridColumns) => {
    setGridColumns(columns);
    try {
      localStorage.setItem(GRID_COLUMNS_STORAGE_KEY, String(columns));
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
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/phanturne/metadachi"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open GitHub repository"
            title="GitHub repository"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.08 3.29 9.38 7.85 10.9.57.1.78-.25.78-.56 0-.28-.01-1.03-.02-2.03-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.09 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.73-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.3 3.14 1.17a10.93 10.93 0 0 1 5.72 0c2.18-1.47 3.13-1.17 3.13-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.08 0 4.43-2.69 5.4-5.26 5.68.41.36.78 1.08.78 2.17 0 1.57-.01 2.84-.01 3.23 0 .31.2.67.79.56a11.53 11.53 0 0 0 7.84-10.9C23.5 5.66 18.35.5 12 .5Z" />
            </svg>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-col gap-4 mb-8">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar
          selected={typeFilter}
          onSelect={setTypeFilter}
          counts={counts}
          config={config}
          rightSlot={
            <>
              <button
                type="button"
                data-testid="vault-view-cards"
                aria-pressed={viewMode === 'cards'}
                onClick={() => persistViewMode('cards')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors',
                  viewMode === 'cards' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted/50'
                )}
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                Cards
              </button>
              <button
                type="button"
                data-testid="vault-view-tree"
                aria-pressed={viewMode === 'tree'}
                onClick={() => persistViewMode('tree')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors',
                  viewMode === 'tree' ? 'bg-muted text-foreground' : 'bg-background text-muted-foreground hover:bg-muted/50'
                )}
              >
                <FolderTree className="h-4 w-4" aria-hidden="true" />
                Tree
              </button>
              {viewMode === 'cards' && hasHydrated && (
                <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  <span>Per row</span>
                  <select
                    value={gridColumns}
                    onChange={(e) => persistGridColumns(Number(e.target.value) as GridColumns)}
                    className="bg-transparent text-foreground outline-none"
                    data-testid="grid-columns-select"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </label>
              )}
            </>
          }
          vaultReady={!isVaultPending}
        />
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
          <BentoGrid columns={gridColumns}>
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
          <BentoGrid columns={gridColumns}>
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
          <BentoGrid columns={gridColumns}>
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
