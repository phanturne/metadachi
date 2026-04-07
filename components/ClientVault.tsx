'use client';

import { BentoGrid } from '@/components/BentoGrid';
import { CardModal } from '@/components/CardModal';
import { PolymorphicCard } from '@/components/cards';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useVault } from '@/hooks/useVault';
import { Card, CardType } from '@/lib/types';
import { useMemo, useState } from 'react';

export function ClientVault() {
  const { cards } = useVault();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CardType | 'all'>('all');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const selectedCard = useMemo(() => cards.find(c => c.id === selectedCardId) || null, [cards, selectedCardId]);

  const filtered = useMemo(() => {
    return cards.filter(card => {
      const matchesType = typeFilter === 'all' || card.type === typeFilter;
      const matchesQuery = !query ||
        card.title.toLowerCase().includes(query.toLowerCase()) ||
        card.rawContent.toLowerCase().includes(query.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [cards, typeFilter, query]);

  const counts = useMemo(() => {
    const c: Record<CardType | 'all', number> = { all: cards.length, recipe: 0, meeting: 0, note: 0, reference: 0, default: 0 };
    for (const card of cards) {
      c[card.type] = (c[card.type] ?? 0) + 1;
    }
    return c;
  }, [cards]);

  const pinned = useMemo(() => filtered.filter(c => c.pinned && !c.favorite), [filtered]);
  const favorite = useMemo(() => filtered.filter(c => c.favorite), [filtered]);
  const rest = useMemo(() => filtered.filter(c => !c.pinned && !c.favorite), [filtered]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Metadachi</h1>
        <ThemeToggle />
      </header>

      <div className="flex flex-col gap-4 mb-8">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar selected={typeFilter} onSelect={setTypeFilter} counts={counts} />
      </div>

      {favorite.length > 0 && (
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            ❤️ Favorites
          </h2>
          <BentoGrid>
            {favorite.map(card => (
              <div key={card.id} onClick={() => setSelectedCardId(card.id)} style={{ cursor: 'pointer' }}>
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
              <div key={card.id} onClick={() => setSelectedCardId(card.id)} style={{ cursor: 'pointer' }}>
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
              : 'No cards match your search.'}
          </div>
        ) : (
          <BentoGrid>
            {rest.map(card => (
              <div key={card.id} onClick={() => setSelectedCardId(card.id)} style={{ cursor: 'pointer' }}>
                <PolymorphicCard card={card} />
              </div>
            ))}
          </BentoGrid>
        )}
      </section>

      <CardModal card={selectedCard} onClose={() => setSelectedCardId(null)} />
    </div>
  );
}
