'use client';

import { Calendar, Tag, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface CardModalProps {
  card: Card | null;
  onClose: () => void;
}

export function CardModal({ card, onClose }: CardModalProps) {
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
