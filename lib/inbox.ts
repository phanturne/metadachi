import matter from 'gray-matter';
import path from 'path';
import type { Card, CardType } from './types';

export const INBOX_PATH_PREFIX = 'Inbox/';

/** Denied inbox items are moved under this folder (vault-relative). */
export const ARCHIVE_INBOX_DENIED_PREFIX = 'archive/inbox/';

export function normalizeVaultRel(rel: string): string {
  return rel.replace(/\\/g, '/');
}

export function cardIsInbox(card: Card): boolean {
  if (card.inbox === true) return true;
  const rel = normalizeVaultRel(card.relativePath);
  return rel.startsWith(INBOX_PATH_PREFIX);
}

/**
 * Default destination for an approved inbox item: `suggested_path` if valid, else `notes/<basename>`.
 */
export function defaultApproveRelativePath(card: Card): string {
  const sp = card.suggested_path;
  if (typeof sp === 'string' && sp.trim()) {
    const cleaned = normalizeVaultRel(sp.trim()).replace(/^\/+/, '');
    if (cleaned && !cleaned.includes('..') && cleaned.endsWith('.md')) {
      return cleaned;
    }
  }
  const base = path.posix.basename(normalizeVaultRel(card.relativePath));
  return path.posix.join('notes', base);
}

export function defaultRejectRelativePath(card: Card): string {
  const base = path.posix.basename(normalizeVaultRel(card.relativePath));
  return path.posix.join('archive/inbox', base);
}

export function buildTakenRelativePaths(cards: Card[]): Set<string> {
  return new Set(cards.map(c => normalizeVaultRel(c.relativePath)));
}

export function uniqueRelativePath(candidate: string, taken: Set<string>): string {
  const c = normalizeVaultRel(candidate);
  if (!taken.has(c)) return c;
  const dir = path.posix.dirname(c);
  const stem = path.posix.basename(c, '.md');
  let i = 1;
  let next = path.posix.join(dir, `${stem}-${i}.md`);
  while (taken.has(next)) {
    i++;
    next = path.posix.join(dir, `${stem}-${i}.md`);
  }
  return next;
}

export function buildApprovedMarkdown(raw: string, card: Card, targetType: CardType): string {
  const parsed = matter(raw);
  const fm = { ...(parsed.data as Record<string, unknown>) };
  fm.id = card.id;
  delete fm.inbox;
  delete fm.source;
  delete fm.suggested_path;
  fm.type = targetType;
  const body = typeof parsed.content === 'string' ? parsed.content : '';
  return matter.stringify(body, fm);
}

export function buildRejectedMarkdown(raw: string, card: Card): string {
  const parsed = matter(raw);
  const fm = { ...(parsed.data as Record<string, unknown>) };
  fm.id = card.id;
  delete fm.inbox;
  delete fm.source;
  delete fm.suggested_path;
  fm.review_status = 'rejected';
  const body = typeof parsed.content === 'string' ? parsed.content : '';
  return matter.stringify(body, fm);
}
