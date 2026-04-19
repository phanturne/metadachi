'use client';

import Link from 'next/link';
import type { Card } from '@/lib/types';

type InboxHomeSectionProps = {
  inboxCards: Card[];
};

export function InboxHomeSection({ inboxCards }: InboxHomeSectionProps) {
  const preview = inboxCards.slice(0, 3);
  const count = inboxCards.length;

  return (
    <section className="mb-8" data-testid="inbox-home-section" aria-label="Inbox summary">
      <div className="rounded-xl border border-border bg-card/30 px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Inbox
            <span
              className={
                count === 0
                  ? 'bg-muted text-muted-foreground text-[0.65rem] px-2 py-0.5 rounded-full font-normal tabular-nums'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[0.65rem] px-2 py-0.5 rounded-full font-normal tabular-nums'
              }
            >
              {count}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {count === 0
              ? 'Nothing waiting for review. Captures with inbox metadata or under Inbox/ will show up here.'
              : count === 1
                ? '1 item needs review.'
                : `${count} items need review.`}{' '}
            Denied notes are stored under{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">archive/inbox/</code>.
          </p>
          {preview.length > 0 && (
            <ul className="mt-2 text-sm text-foreground/90 list-disc list-inside truncate">
              {preview.map(c => (
                <li key={c.id} className="truncate">
                  {c.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          href="/inbox"
          className="shrink-0 inline-flex items-center justify-center rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          data-testid="inbox-home-link"
        >
          Open inbox
        </Link>
      </div>
    </section>
  );
}
