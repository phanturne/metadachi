'use client';

import { BentoGrid } from '@/components/BentoGrid';
import { CardModal } from '@/components/CardModal';
import { PolymorphicCard } from '@/components/cards';
import { SearchBar } from '@/components/SearchBar';
import { useVault } from '@/hooks/useVault';
import { Card, CardType } from '@/lib/types';
import { useMemo, useState } from 'react';
import { User, Globe } from 'lucide-react';

interface ClientHubViewProps {
  username: string;
  initialCards: Card[];
}

export function ClientHubView({ username, initialCards }: ClientHubViewProps) {
  // In hub mode, useVault will fetch from /api/vault (which we can override via initialData)
  // or we can just use the initialCards passed from the server.
  const [query, setQuery] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  
  const filtered = useMemo(() => {
    return initialCards.filter(card => {
      const matchesQuery = !query ||
        card.title.toLowerCase().includes(query.toLowerCase()) ||
        card.rawContent.toLowerCase().includes(query.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      return matchesQuery;
    });
  }, [initialCards, query]);

  const selectedCard = useMemo(
    () => initialCards.find(c => c.filePath === selectedFilePath) || null,
    [initialCards, selectedFilePath]
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-8">
      <header className="mb-12 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">@{username}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Globe className="w-4 h-4" />
              Metadachi Community Member
            </p>
          </div>
        </div>
      </header>

      <div className="mb-8">
        <SearchBar value={query} onChange={setQuery} placeholder={`Search @${username}'s cookbook...`} />
      </div>

      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Published Cards
          <span className="bg-secondary text-secondary-foreground text-[0.65rem] px-2 py-0.5 rounded-full font-normal">
            {filtered.length}
          </span>
        </h2>
        
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
            No published cards found.
          </div>
        ) : (
          <BentoGrid columns={3}>
            {filtered.map(card => (
              <div key={card.filePath} onClick={() => setSelectedFilePath(card.filePath)} style={{ cursor: 'pointer' }}>
                <PolymorphicCard card={card} />
              </div>
            ))}
          </BentoGrid>
        )}
      </section>

      <CardModal card={selectedCard} onClose={() => setSelectedFilePath(null)} />
      
      <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>Powered by <span className="font-bold text-foreground">Metadachi</span> — The local-first community platform.</p>
        <button className="mt-4 px-4 py-2 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity">
          Create your own Vault
        </button>
      </footer>
    </div>
  );
}
