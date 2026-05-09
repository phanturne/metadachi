'use client';

import {
  FlashcardEditor,
  FlashcardViewInteractive,
  ReviewSession
} from '@/components/flashcards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FAMILIARITY_LEVELS,
  Flashcard,
  FlashcardGroup,
  useCreateFlashcard,
  useDeleteFlashcard,
  useFlashcards,
  useFlashcardsByFamiliarity,
  useFlashcardsGrouped,
  useFlashcardStats,
  useReviewFlashcard,
  useToggleDeckPublished,
  useUpdateFamiliarityLevel,
} from '@/lib/hooks/useFlashcards';
import { FamiliarityLevel } from '@/lib/srs';
import { motion } from 'framer-motion';
import { Brain, ChevronRight, Clock, Globe, GripVertical, Layers, Zap } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Tab = 'review' | 'decks' | 'all' | 'levels';
const FLASHCARDS_TAB_STORAGE_KEY = 'metadachi-flashcards-active-tab';

function readStoredFlashcardsTab(): Tab {
  if (typeof window === 'undefined') return 'review';
  try {
    const value = localStorage.getItem(FLASHCARDS_TAB_STORAGE_KEY);
    if (value === 'review' || value === 'decks' || value === 'all' || value === 'levels') {
      return value;
    }
  } catch {
    // Ignore read errors and fall back to default.
  }
  return 'review';
}

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('review');
  const [hasLoadedStoredTab, setHasLoadedStoredTab] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | undefined>();
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<Flashcard | null>(null);

  const { data: allCards = [], isLoading: loadingAll } = useFlashcards();
  const deckGroups = useFlashcardsGrouped();
  const stats = useFlashcardStats();
  const flashcardsByFamiliarity = useFlashcardsByFamiliarity();
  const createFlashcard = useCreateFlashcard();
  const reviewFlashcard = useReviewFlashcard();
  const updateFamiliarityLevel = useUpdateFamiliarityLevel();
  const deleteFlashcard = useDeleteFlashcard();
  const toggleDeckPublished = useToggleDeckPublished();
  const [publishedDecks, setPublishedDecks] = useState<Record<string, boolean>>({});
  const deckNames = useMemo(
    () => deckGroups.map((group) => group.deck).sort(),
    [deckGroups]
  );
  const deckNamesKey = useMemo(
    () => deckNames.join('|'),
    [deckNames]
  );

  useEffect(() => {
    if (!deckNamesKey) {
      setPublishedDecks((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    let isCancelled = false;

    const fetchDeckStates = async () => {
      const states: Record<string, boolean> = {};
      for (const deck of deckNames) {
        try {
          const res = await fetch(`/api/vault/deck-published?deck=${encodeURIComponent(deck)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.published !== undefined) {
              states[deck] = data.published;
            }
          }
        } catch {
          // Ignore errors
        }
      }
      if (isCancelled) return;
      setPublishedDecks((prev) => {
        const prevKeys = Object.keys(prev).sort();
        const nextKeys = Object.keys(states).sort();
        if (prevKeys.length !== nextKeys.length) return states;
        for (let i = 0; i < nextKeys.length; i++) {
          const key = nextKeys[i];
          if (prevKeys[i] !== key || prev[key] !== states[key]) {
            return states;
          }
        }
        return prev;
      });
    };
    fetchDeckStates();

    return () => {
      isCancelled = true;
    };
  }, [deckNames, deckNamesKey]);

  useEffect(() => {
    setActiveTab(readStoredFlashcardsTab());
    setHasLoadedStoredTab(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredTab) return;
    try {
      localStorage.setItem(FLASHCARDS_TAB_STORAGE_KEY, activeTab);
    } catch {
      // Ignore persistence failures.
    }
  }, [activeTab, hasLoadedStoredTab]);

  const handleToggleDeckPublish = (deck: string, currentPublished: boolean) => {
    toggleDeckPublished.mutate({ deck, published: !currentPublished });
    setPublishedDecks(prev => ({ ...prev, [deck]: !currentPublished }));
  };

  const handleSaveCard = async (card: { front: string; back: string; deck?: string; tags: string[]; difficulty?: string; category?: string }) => {
    await createFlashcard.mutateAsync({
      front: card.front,
      back: card.back,
      deck: card.deck || 'default',
      tags: card.tags,
      difficulty: card.difficulty,
      category: card.category,
    });
    setIsEditorOpen(false);
    setEditingCard(undefined);
  };

  const handleSelectBucket = async (flashcard: Flashcard, level: FamiliarityLevel) => {
    const now = new Date().toISOString();
    if (flashcard.familiarity_level === level) {
      await reviewFlashcard.mutateAsync({
        id: flashcard.id,
        relativePath: flashcard.relativePath,
        lastReviewedAt: now,
      });
      return;
    }

    await Promise.all([
      reviewFlashcard.mutateAsync({
        id: flashcard.id,
        relativePath: flashcard.relativePath,
        lastReviewedAt: now,
      }),
      updateFamiliarityLevel.mutateAsync({
        id: flashcard.id,
        relativePath: flashcard.relativePath,
        familiarity_level: level,
      }),
    ]);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  const handleDeleteCard = async (cardId: string) => {
    await deleteFlashcard.mutateAsync(cardId);
  };

  const handleDeckClick = (group: FlashcardGroup) => {
    setSelectedDeck(group.deck);
    setActiveTab('review');
  };

  const handleCardClick = (card: Flashcard) => {
    setPreviewCard(card);
  };

  const handleClosePreview = () => {
    setPreviewCard(null);
  };

  useEffect(() => {
    if (!previewCard) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewCard(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewCard]);

  const tabs: { id: 'review' | 'decks' | 'all' | 'levels'; label: string; count?: number }[] = [
    { id: 'review', label: 'Review', count: allCards.length },
    { id: 'decks', label: 'Decks' },
    { id: 'levels', label: 'Levels' },
    { id: 'all', label: 'All Cards', count: stats.total },
  ];

  const getReviewCards = () => {
    let cards = allCards;
    if (selectedDeck) {
      cards = cards.filter(c => c.deck === selectedDeck);
    }
    return cards;
  };

  const reviewCards = getReviewCards();

  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Vault
          </Link>
        </div>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Flashcards
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Track your learning progress. Review cards and adjust familiarity levels.
            </p>
          </div>
          <Button onClick={() => setIsEditorOpen(true)}>
            Add New
          </Button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Zap className="w-4 h-4" />} label="New" value={stats.new} color="blue" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Learning" value={stats.learning} color="yellow" />
        <StatCard icon={<Brain className="w-4 h-4" />} label="Mastered" value={stats.mastered} color="green" />
        <StatCard icon={<Layers className="w-4 h-4" />} label="Total" value={stats.total} color="gray" />
      </div>

      {selectedDeck && (
        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Reviewing deck:</span>
          <Badge variant="outline" className="text-sm">
            {selectedDeck}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDeck(null)}
          >
            All decks
          </Button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-border">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors relative
                ${
                  activeTab === tab.id
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <Badge
                  variant={activeTab === tab.id ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {tab.count}
                </Badge>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: 'spring', bounce: 0.2 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loadingAll ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading flashcards...</p>
          </div>
        ) : activeTab === 'review' && (
          <ReviewSession
            flashcards={reviewCards}
            onComplete={() => setActiveTab('decks')}
            onSelectLevel={handleSelectBucket}
          />
        )}

        {activeTab === 'decks' && (
          <DeckGroupsView
            groups={deckGroups}
            onDeckClick={handleDeckClick}
            onCreateCard={() => setIsEditorOpen(true)}
            publishedDecks={publishedDecks}
            onTogglePublish={handleToggleDeckPublish}
            isPublishing={toggleDeckPublished.isPending}
          />
        )}

        {activeTab === 'levels' && (
          <LevelsView
            buckets={flashcardsByFamiliarity}
            onCardClick={handleCardClick}
            onMoveLevel={async (card: Flashcard, newLevel: FamiliarityLevel) => {
              await updateFamiliarityLevel.mutateAsync({
                id: card.id,
                relativePath: card.relativePath,
                familiarity_level: newLevel,
              });
            }}
            onTouchReviewed={async (card: Flashcard) => {
              const now = new Date().toISOString();
              await reviewFlashcard.mutateAsync({
                id: card.id,
                relativePath: card.relativePath,
                lastReviewedAt: now,
              });
            }}
          />
        )}

        {activeTab === 'all' && (
          <div className="space-y-4">
            {allCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
                <p className="text-muted-foreground mb-4">No flashcards yet</p>
                <Button onClick={() => setIsEditorOpen(true)}>
                  Create Your First Card
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {allCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleCardClick(card)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{card.deck}/{card.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {card.front}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {card.deck}
                    </Badge>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEditCard(card)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        🗑️
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Preview Modal */}
      {previewCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleClosePreview();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-background rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">Flashcard Preview</h2>
                <Button variant="ghost" size="icon-sm" onClick={handleClosePreview}>
                  ✕
                </Button>
              </div>
              <FlashcardViewInteractive
                flashcard={previewCard}
                onTouchReviewed={async (card) => {
                  const now = new Date().toISOString();
                  await reviewFlashcard.mutateAsync({
                    id: card.id,
                    relativePath: card.relativePath,
                    lastReviewedAt: now,
                  });
                }}
                onMoveLevel={async (card, newLevel) => {
                  await handleSelectBucket(card, newLevel);
                }}
                onClose={handleClosePreview}
              />
            </div>
          </div>
        </div>
      )}

      <FlashcardEditor
        flashcard={editingCard}
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCard(undefined);
        }}
        onSave={handleSaveCard}
      />
    </div>
  );
}

function StatCard({ icon, label, value, color, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'yellow' | 'green' | 'gray';
  highlight?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    gray: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
  };

  return (
    <Card className={highlight ? 'ring-2 ring-primary/50' : ''}>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DeckGroupsView({
  groups,
  onDeckClick,
  onCreateCard,
  publishedDecks,
  onTogglePublish,
  isPublishing,
}: {
  groups: FlashcardGroup[];
  onDeckClick: (group: FlashcardGroup) => void;
  onCreateCard: () => void;
  publishedDecks: Record<string, boolean>;
  onTogglePublish: (deck: string, currentPublished: boolean) => void;
  isPublishing: boolean;
}) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Layers className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No decks yet</p>
        <Button onClick={onCreateCard}>
          Create Your First Card
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => {
        const isPublished = publishedDecks[group.deck] ?? false;
        return (
          <motion.div
            key={group.deck}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card
              className="hover:bg-muted/50 transition-colors h-full cursor-pointer"
              onClick={() => onDeckClick(group)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{group.deck}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublish(group.deck, isPublished);
                      }}
                      disabled={isPublishing}
                      className={`transition-all ${
                        isPublished
                          ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-500/10'
                          : 'text-muted-foreground hover:text-blue-500 hover:bg-muted'
                      }`}
                      title={isPublished ? 'Published to Community' : 'Publish to Community'}
                    >
                      <Globe className="w-4 h-4" strokeWidth={2} />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline" className="text-xs">
                    {group.count} cards
                  </Badge>
                  {isPublished && (
                    <Badge variant="default" className="text-xs bg-blue-500/20 text-blue-500 hover:bg-blue-500/20">
                      Published
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function LevelsView({
  buckets,
  onCardClick,
  onMoveLevel,
  onTouchReviewed,
}: {
  buckets: Record<FamiliarityLevel, Flashcard[]>;
  onCardClick: (card: Flashcard) => void;
  onMoveLevel: (card: Flashcard, newLevel: FamiliarityLevel) => void | Promise<void>;
  onTouchReviewed: (card: Flashcard) => void | Promise<void>;
}) {
  const [dragOverLevel, setDragOverLevel] = useState<FamiliarityLevel | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const findCardById = useCallback(
    (id: string): Flashcard | undefined => {
      for (const level of FAMILIARITY_LEVELS) {
        const found = buckets[level].find((c) => c.id === id);
        if (found) return found;
      }
      return undefined;
    },
    [buckets]
  );

  const handleDragStart = (e: React.DragEvent, card: Flashcard) => {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(card.id);

    // Use the card row as the drag image (looks much nicer than the small handle).
    // We clone into an offscreen element so we can safely pass it to setDragImage.
    const row = (e.currentTarget as HTMLElement | null)?.closest?.('[data-drag-preview="flashcard-row"]') as HTMLElement | null;
    if (!row) return;

    const clone = row.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = '-1000px';
    clone.style.left = '-1000px';
    clone.style.width = `${row.getBoundingClientRect().width}px`;
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '0.95';
    clone.style.transform = 'rotate(-1deg)';
    clone.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
    document.body.appendChild(clone);

    try {
      e.dataTransfer.setDragImage(clone, 24, 24);
    } finally {
      // Cleanup after drag image is captured.
      window.setTimeout(() => clone.remove(), 0);
    }
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverLevel(null);
  };

  const handleColumnDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDragOver = (e: React.DragEvent, level: FamiliarityLevel) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLevel(level);
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && e.currentTarget.contains(next)) return;
    setDragOverLevel(null);
  };

  const handleColumnDrop = async (e: React.DragEvent, level: FamiliarityLevel) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLevel(null);
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    const card = findCardById(id);
    if (!card || card.familiarity_level === level) return;
    await Promise.resolve(onMoveLevel(card, level));
  };

  const levelConfig: Record<FamiliarityLevel, { label: string; description: string; icon: React.ReactNode; color: string; bgColor: string }> = {
    new: {
      label: 'New',
      description: 'Just added or needs relearning',
      icon: <Zap className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-200 dark:border-blue-800',
    },
    learning: {
      label: 'Learning',
      description: 'In active review',
      icon: <Clock className="w-5 h-5" />,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-500/10 border-yellow-200 dark:border-yellow-800',
    },
    mastered: {
      label: 'Mastered',
      description: 'Solid knowledge, review occasionally',
      icon: <Brain className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10 border-green-200 dark:border-green-800',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {FAMILIARITY_LEVELS.map((level) => {
        const cards = buckets[level];
        const config = levelConfig[level];

        return (
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto"
          >
            <div
              className={`rounded-xl border ${config.bgColor} p-4 h-[calc(100vh-24rem)] min-h-[24rem] flex flex-col transition-shadow ${
                dragOverLevel === level && draggingId
                  ? 'ring-2 ring-primary/50 shadow-md bg-primary/5'
                  : ''
              }`}
              onDragEnter={handleColumnDragEnter}
              onDragOver={(e) => handleColumnDragOver(e, level)}
              onDragLeave={handleColumnDragLeave}
              onDrop={(e) => handleColumnDrop(e, level)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <div className={config.color}>{config.icon}</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{config.label}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  {cards.length} cards
                </Badge>
              </div>

              <div
                className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0 rounded-lg"
              >
                {cards.length === 0 ? (
                  <div className="h-full min-h-[8rem] flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-border/60 bg-background/30 p-4">
                    <p className="text-sm text-muted-foreground">No cards in {config.label.toLowerCase()} yet.</p>
                    <p className="text-xs text-muted-foreground/80 mt-2">Drop a card here to set it to {config.label.toLowerCase()}.</p>
                  </div>
                ) : (
                  cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: draggingId === card.id ? 0.45 : 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                      data-drag-preview="flashcard-row"
                    >
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => handleDragStart(e, card)}
                        onDragEnd={handleDragEnd}
                        className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-grab active:cursor-grabbing touch-none"
                        title="Drag to another column"
                        aria-label="Drag to another column"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => onCardClick(card)}
                      >
                        <div className="font-medium truncate text-sm">{card.deck}/{card.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {card.front.length > 60 ? `${card.front.slice(0, 60)}...` : card.front}
                        </div>
                        {card.last_reviewed_at && (
                          <div className="text-xs text-muted-foreground/70 mt-1">
                            Last: {new Date(card.last_reviewed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {FAMILIARITY_LEVELS.map((target) => {
                          const isCurrent = target === level;
                          const title = isCurrent
                            ? `Mark reviewed (keep ${target})`
                            : `Move to ${target}`;
                          const icon =
                            target === 'new'
                              ? <Zap className="w-4 h-4" />
                              : target === 'learning'
                                ? <Clock className="w-4 h-4" />
                                : <Brain className="w-4 h-4" />;

                          return (
                            <Button
                              key={target}
                              variant="ghost"
                              size="icon-sm"
                              className={isCurrent ? 'bg-muted text-foreground' : 'text-muted-foreground'}
                              aria-pressed={isCurrent}
                              title={title}
                              onClick={() => {
                                if (isCurrent) {
                                  void onTouchReviewed(card);
                                } else {
                                  void onMoveLevel(card, target);
                                }
                              }}
                            >
                              {icon}
                            </Button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}