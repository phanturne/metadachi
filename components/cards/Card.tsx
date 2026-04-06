'use client';

import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, Heart, Pin } from 'lucide-react';
import { useVault } from '@/hooks/useVault';

interface CardProps {
  card: CardType;
  className?: string;
}

export function Card({ card, className }: CardProps) {
  const { togglePin, toggleFavorite } = useVault();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="h-full"
    >
      <ShadcnCard className={cn("h-full cursor-pointer hover:bg-muted/50 transition-colors", className)}>
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground mb-1">
            <FileText size={14} />
            <span>{card.type}</span>
            <div className="ml-auto flex gap-1">
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(card.id, !!card.favorite); }}
                className={`p-1 rounded-md transition-colors ${card.favorite ? "text-red-500" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Heart size={14} className={card.favorite ? "fill-current" : ""} />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(card.id, !!card.pinned); }}
                className={`p-1 rounded-md transition-colors ${card.pinned ? "text-yellow-500" : "text-muted-foreground hover:bg-muted"}`}
              >
                <Pin size={14} className={card.pinned ? "fill-current" : ""} />
              </button>
            </div>
          </div>
          <CardTitle className="text-lg font-semibold leading-tight text-zinc-100">
            {card.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.tags.map(tag => (
                <span key={tag} className="text-[0.7rem] text-muted-foreground bg-zinc-800/50 px-1.5 py-0.5 rounded-sm">#{tag}</span>
              ))}
            </div>
          )}
          {card.rawContent && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {card.rawContent.slice(0, 120)}
              {card.rawContent.length > 120 ? '…' : ''}
            </p>
          )}
        </CardContent>
      </ShadcnCard>
    </motion.div>
  );
}
