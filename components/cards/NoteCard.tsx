'use client';

import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/types';
import { StickyNote } from 'lucide-react';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NoteCardProps {
  card: CardType;
}

export function NoteCard({ card }: NoteCardProps) {
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
            <StickyNote size={14} />
            <span>Note</span>
            {card.pinned && <span className="ml-auto">📌</span>}
          </div>
          <CardTitle className="text-lg font-semibold leading-tight text-zinc-100">
            {card.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.tags.map(tag => <span key={tag} className="text-[0.7rem] text-muted-foreground bg-zinc-800/50 px-1.5 py-0.5 rounded-sm">#{tag}</span>)}
            </div>
          )}
          {card.rawContent && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
              {card.rawContent.slice(0, 150)}
              {card.rawContent.length > 150 ? '…' : ''}
            </p>
          )}
        </CardContent>
      </ShadcnCard>
    </motion.div>
  );
}
