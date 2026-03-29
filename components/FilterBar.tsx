'use client';

import { Badge } from '@/components/ui/badge';
import { CardType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  selected: CardType | 'all';
  onSelect: (type: CardType | 'all') => void;
  counts: Record<CardType | 'all', number>;
}

const TYPES: Array<{ value: CardType | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'recipe', label: 'Recipes' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'note', label: 'Notes' },
  { value: 'reference', label: 'Reference' },
  { value: 'default', label: 'Other' },
];

export function FilterBar({ selected, onSelect, counts }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map(({ value, label }) => {
        const isActive = selected === value;
        return (
          <Badge
            key={value}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onSelect(value)}
            className={cn(
              "cursor-pointer px-4 py-3 rounded-full transition-all text-sm font-medium"
            )}
          >
            {label}
            {counts[value] !== undefined && (
              <span className="ml-1.5 text-[0.65rem] opacity-70 font-normal">
                {counts[value]}
              </span>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
