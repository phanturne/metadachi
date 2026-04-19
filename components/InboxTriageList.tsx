'use client';

import { useMemo, useState } from 'react';
import { useVault } from '@/hooks/useVault';
import type { Card, CardType, VaultConfig } from '@/lib/types';
import {
  buildApprovedMarkdown,
  buildRejectedMarkdown,
  buildTakenRelativePaths,
  defaultApproveRelativePath,
  defaultRejectRelativePath,
  normalizeVaultRel,
  uniqueRelativePath,
} from '@/lib/inbox';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type InboxTriageListProps = {
  config: VaultConfig | null;
  inboxCards: Card[];
  /** Root test id for the page vs embedded contexts. */
  testId?: string;
};

function typeOptions(config: VaultConfig | null): Array<{ id: CardType; label: string }> {
  const types = config?.types?.length ? config.types : [];
  if (types.length === 0) {
    return [
      { id: 'note', label: 'Notes' },
      { id: 'default', label: 'Other' },
    ];
  }
  return types.map(t => ({ id: t.id, label: t.label }));
}

export function InboxTriageList({ config, inboxCards, testId = 'inbox-triage' }: InboxTriageListProps) {
  const { allCards, saveVaultFileAsync, relocateVaultFileAsync, vaultFileBusy, capabilities } = useVault();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const types = useMemo(() => typeOptions(config), [config]);

  const canAct = capabilities.canEditContent && capabilities.canRelocateFile;

  async function approve(card: Card, targetType: CardType) {
    setError(null);
    setPendingId(card.id);
    try {
      const others = allCards.filter(c => c.id !== card.id);
      const taken = buildTakenRelativePaths(others);
      const desired = defaultApproveRelativePath(card);
      const dest = uniqueRelativePath(desired, taken);
      const newRaw = buildApprovedMarkdown(card.rawContent, card, targetType);
      await saveVaultFileAsync(card.id, card.relativePath, newRaw);
      if (normalizeVaultRel(dest) !== normalizeVaultRel(card.relativePath)) {
        await relocateVaultFileAsync(card.id, card.relativePath, dest);
      }
    } catch (e) {
      setError((e as Error).message || 'Could not approve');
    } finally {
      setPendingId(null);
    }
  }

  async function deny(card: Card) {
    setError(null);
    setPendingId(card.id);
    try {
      const taken = buildTakenRelativePaths(allCards.filter(c => c.id !== card.id));
      const desired = defaultRejectRelativePath(card);
      const dest = uniqueRelativePath(desired, taken);
      const newRaw = buildRejectedMarkdown(card.rawContent, card);
      await saveVaultFileAsync(card.id, card.relativePath, newRaw);
      if (normalizeVaultRel(dest) !== normalizeVaultRel(card.relativePath)) {
        await relocateVaultFileAsync(card.id, card.relativePath, dest);
      }
    } catch (e) {
      setError((e as Error).message || 'Could not deny');
    } finally {
      setPendingId(null);
    }
  }

  if (inboxCards.length === 0) {
    return (
      <p className="text-sm text-muted-foreground border border-dashed border-border rounded-xl py-12 text-center" data-testid={`${testId}-empty`}>
        Nothing in the inbox. Captures with <code className="text-xs bg-muted px-1 py-0.5 rounded">inbox: true</code> or files under{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">Inbox/</code> appear here.
      </p>
    );
  }

  return (
    <div data-testid={testId}>
      {error && (
        <p className="text-sm text-destructive mb-3" role="alert">
          {error}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {inboxCards.map(card => {
          const busy = vaultFileBusy || pendingId === card.id;
          const defaultType =
            (types.find(t => t.id === card.type)?.id as CardType | undefined) ?? types[0]?.id ?? 'note';
          return (
            <InboxRow
              key={card.id}
              card={card}
              types={types}
              defaultType={defaultType}
              disabled={!canAct || busy}
              onApprove={t => void approve(card, t)}
              onDeny={() => void deny(card)}
            />
          );
        })}
      </ul>
    </div>
  );
}

function InboxRow({
  card,
  types,
  defaultType,
  disabled,
  onApprove,
  onDeny,
}: {
  card: Card;
  types: Array<{ id: CardType; label: string }>;
  defaultType: CardType;
  disabled: boolean;
  onApprove: (t: CardType) => void;
  onDeny: () => void;
}) {
  const [type, setType] = useState<CardType>(defaultType);
  const preview =
    card.rawContent.trim().slice(0, 160) + (card.rawContent.trim().length > 160 ? '…' : '');

  return (
    <li
      data-testid={`inbox-row-${card.id}`}
      className={cn(
        'rounded-xl border border-border bg-card/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between'
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium text-foreground truncate">{card.title}</div>
        {card.source && (
          <div className="text-[0.65rem] uppercase tracking-wide text-muted-foreground mt-0.5">{card.source}</div>
        )}
        {preview && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{preview}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          Type
          <select
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            value={type}
            onChange={e => setType(e.target.value as CardType)}
            disabled={disabled}
          >
            {types.map(t => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="default" size="sm" disabled={disabled} onClick={() => onApprove(type)}>
          Approve
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={onDeny}>
          Deny
        </Button>
      </div>
    </li>
  );
}
