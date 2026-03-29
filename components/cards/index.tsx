'use client';

import { Card as CardType } from '@/lib/types';
import { RecipeCard } from './RecipeCard';
import { MeetingCard } from './MeetingCard';
import { NoteCard } from './NoteCard';
import { Card } from './Card';

interface PolymorphicCardProps {
  card: CardType;
  className?: string;
}

export function PolymorphicCard({ card, className }: PolymorphicCardProps) {
  switch (card.type) {
    case 'recipe':
      return <RecipeCard card={card} />;
    case 'meeting':
      return <MeetingCard card={card} />;
    case 'note':
      return <NoteCard card={card} />;
    default:
      return <Card card={card} className={className} />;
  }
}

export { Card, RecipeCard, MeetingCard, NoteCard };
