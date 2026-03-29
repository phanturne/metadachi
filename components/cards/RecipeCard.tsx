'use client';

import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { Clock, ChefHat } from 'lucide-react';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecipeCardProps {
  card: CardType;
}

export function RecipeCard({ card }: RecipeCardProps) {
  const ingredients = card.rawContent.match(/^- .+$/m)?.slice(0, 5) ?? [];
  const hasTimes = card.rawContent.includes('prep') || card.rawContent.includes('cook');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full"
    >
      <ShadcnCard className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-1">
            <ChefHat size={14} />
            <span>Recipe</span>
            {card.pinned && <span className="ml-auto">📌</span>}
          </div>
          <CardTitle className="text-lg font-semibold leading-tight text-zinc-100">
            {card.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex flex-col gap-3">
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {card.tags.map(tag => <span key={tag} className="text-[0.7rem] text-muted-foreground bg-zinc-800/50 px-1.5 py-0.5 rounded-sm">#{tag}</span>)}
            </div>
          )}
          {hasTimes && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} />
              <span>View for times</span>
            </div>
          )}
          {ingredients.length > 0 && (
            <ul className="text-xs text-muted-foreground pl-4 list-disc space-y-0.5 mt-1">
              {ingredients.map((ing, i) => (
                <li key={i}>{ing.replace(/^- /, '')}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </ShadcnCard>
    </motion.div>
  );
}
