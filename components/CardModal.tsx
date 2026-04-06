'use client';

import { Calendar, Tag, FileText, Heart, Pin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVault } from '@/hooks/useVault';

interface CardModalProps {
  card: Card | null;
  onClose: () => void;
}

export function CardModal({ card, onClose }: CardModalProps) {
  const { togglePin, toggleFavorite } = useVault();
  
  return (
    <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[85vw] md:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0">
        {card && (
          <>
            <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-6 pb-2 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="uppercase text-[0.65rem] tracking-wider">
                    {card.type}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(card.created).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(card.id, !!card.favorite)}
                    className={`transition-all rounded-full ${
                      card.favorite 
                      ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-500/10' 
                      : 'text-muted-foreground hover:text-pink-500 hover:bg-muted'
                    }`}
                  >
                    <Heart className="w-4 h-4" strokeWidth={2} fill={card.favorite ? "currentColor" : "none"} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePin(card.id, !!card.pinned)}
                    className={`transition-all rounded-full ${
                      card.pinned 
                      ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10' 
                      : 'text-muted-foreground hover:text-red-500 hover:bg-muted'
                    }`}
                  >
                    <Pin className="w-4 h-4" strokeWidth={2} fill={card.pinned ? "currentColor" : "none"} />
                  </Button>
                </div>
              </div>

              <DialogHeader>
                <DialogTitle className="text-xl font-bold leading-tight">
                  {card.title}
                </DialogTitle>
              </DialogHeader>

              {card.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5 mt-3 text-sm text-muted-foreground">
                  <Tag className="w-3.5 h-3.5 mr-1" />
                  {card.tags.map(tag => (
                    <span key={tag} className="text-xs">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 pt-4 flex flex-col gap-4">
              <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                <ReactMarkdown>{card.rawContent}</ReactMarkdown>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
