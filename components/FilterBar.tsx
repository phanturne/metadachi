'use client';

import { Badge } from '@/components/ui/badge';
import { CardType, VaultConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Reorder } from 'framer-motion';
import { ReactNode, useLayoutEffect, useRef, useState } from 'react';

interface FilterBarProps {
  selected: CardType | 'all';
  onSelect: (type: CardType | 'all') => void;
  counts: Record<CardType | 'all', number>;
  config: VaultConfig | null;
  rightSlot?: ReactNode;
  /** When false, show a placeholder so we never paint the hardcoded default order before real config loads (avoids reorder flash on refresh). */
  vaultReady: boolean;
}

const DEFAULT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'recipe', label: 'Recipes' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'note', label: 'Notes' },
  { value: 'reference', label: 'Reference' },
  { value: 'default', label: 'Other' },
];

export function FilterBar({ selected, onSelect, counts, config, rightSlot, vaultReady }: FilterBarProps) {
  const [items, setItems] = useState<Array<{ value: string; label: string }>>([]);
  const latestItemsRef = useRef(items);
  /** Avoid resetting Reorder when React Query returns a new `config` object with identical content (every refetch). */
  const lastConfigItemsSig = useRef<string>('');

  useLayoutEffect(() => {
    latestItemsRef.current = items;
  }, [items]);

  useLayoutEffect(() => {
    if (!vaultReady) return;
    const order = config?.filterBarOrder;
    const generated =
      order?.length && order.length > 0
        ? order.map((id) => {
            if (id === 'all') return { value: 'all', label: 'All' };
            const found = config?.types?.find((t) => t.id === id);
            return { value: id, label: found?.label || (id === 'default' ? 'Other' : id) };
          })
        : DEFAULT_TYPES;
    const sig = JSON.stringify(generated.map((i) => [i.value, i.label]));
    if (sig === lastConfigItemsSig.current) return;
    lastConfigItemsSig.current = sig;
    setItems(generated);
  }, [config, vaultReady]);

  if (!vaultReady) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div
          className="flex flex-wrap gap-2 m-0 p-0 list-none"
          aria-busy="true"
          aria-label="Loading filters"
        >
          {DEFAULT_TYPES.map(({ value }, i) => (
            <div
              key={value}
              className={cn(
                'h-6 rounded-full bg-muted animate-pulse',
                ['w-10', 'w-[4.25rem]', 'w-[4.75rem]', 'w-12', 'w-20', 'w-14'][i]
              )}
            />
          ))}
        </div>
        {rightSlot && <div className="flex flex-wrap items-center gap-2">{rightSlot}</div>}
      </div>
    );
  }

  const handleReorder = async (newOrder: Array<{ value: string; label: string }>) => {
    const prev = latestItemsRef.current;
    setItems(newOrder); // Optimistic update

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterBarOrder: newOrder.map(i => i.value) }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update config order (${res.status})`);
      }
    } catch (e) {
      console.error('Failed to update config order', e);
      setItems(prev); // Revert optimistic update if persist failed
    }
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <Reorder.Group
        axis="x"
        values={items}
        onReorder={handleReorder}
        className="flex flex-wrap gap-2 m-0 p-0 list-none"
      >
        {items.map((item) => {
          const isActive = selected === item.value;
          const count = counts[item.value] || 0;
          return (
            <Reorder.Item key={item.value} value={item} className="list-none" data-testid={`filter-reorder-${item.value}`}>
              <Badge
                variant={isActive ? 'default' : 'outline'}
                onClick={() => onSelect(item.value)}
                data-testid={`filter-chip-${item.value}`}
                className={cn(
                  'cursor-grab active:cursor-grabbing px-4 py-3 rounded-full transition-all text-sm font-medium',
                  isActive && 'shadow-md'
                )}
              >
                {item.label}
                {count > 0 && (
                  <span className="ml-1.5 text-[0.65rem] opacity-70 font-normal">
                    {count}
                  </span>
                )}
              </Badge>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      {rightSlot && <div className="flex flex-wrap items-center gap-2">{rightSlot}</div>}
    </div>
  );
}
