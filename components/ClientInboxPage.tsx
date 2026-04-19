'use client';

import Link from 'next/link';
import { DemoBadge } from '@/components/DemoBadge';
import { InboxTriageList } from '@/components/InboxTriageList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useVault } from '@/hooks/useVault';
import { cardIsInbox } from '@/lib/inbox';
import { useMemo } from 'react';

export function ClientInboxPage() {
  const { cards, config, isVaultPending } = useVault();

  const inboxCards = useMemo(() => cards.filter(cardIsInbox), [cards]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-8" data-testid="inbox-page">
      <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="inbox-back-home"
            >
              ← Vault
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Inbox</h1>
            <DemoBadge />
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Approve sends notes to <code className="text-xs bg-muted px-1 py-0.5 rounded">notes/</code> or{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">suggested_path</code>. Deny moves them to{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">archive/inbox/</code>.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {isVaultPending ? (
        <p className="text-sm text-muted-foreground">Loading vault…</p>
      ) : (
        <InboxTriageList config={config} inboxCards={inboxCards} testId="inbox-triage" />
      )}
    </div>
  );
}
