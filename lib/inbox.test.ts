import { describe, expect, it } from 'vitest';
import type { Card } from './types';
import {
  buildApprovedMarkdown,
  buildRejectedMarkdown,
  buildTakenRelativePaths,
  cardIsInbox,
  defaultApproveRelativePath,
  defaultRejectRelativePath,
  normalizeVaultRel,
  uniqueRelativePath,
} from './inbox';

function makeCard(overrides: Partial<Card>): Card {
  return {
    id: 'test_id',
    type: 'note',
    title: 'T',
    created: new Date().toISOString(),
    tags: [],
    pinned: false,
    favorite: false,
    rawContent: 'Hello',
    filePath: '/vault/Inbox/x.md',
    relativePath: 'Inbox/x.md',
    ...overrides,
  };
}

describe('cardIsInbox', () => {
  it('is true when frontmatter inbox flag is set', () => {
    expect(cardIsInbox(makeCard({ inbox: true, relativePath: 'notes/x.md' }))).toBe(true);
  });

  it('is true when path is under Inbox/', () => {
    expect(cardIsInbox(makeCard({ relativePath: 'Inbox/capture.md', inbox: undefined }))).toBe(true);
  });

  it('is false otherwise', () => {
    expect(cardIsInbox(makeCard({ relativePath: 'notes/x.md' }))).toBe(false);
  });
});

describe('defaultApproveRelativePath', () => {
  it('uses suggested_path when valid', () => {
    const c = makeCard({
      suggested_path: 'meetings/pitch.md',
      relativePath: 'Inbox/x.md',
    });
    expect(defaultApproveRelativePath(c)).toBe('meetings/pitch.md');
  });

  it('falls back to notes/ basename', () => {
    const c = makeCard({ relativePath: 'Inbox/My Idea.md' });
    expect(defaultApproveRelativePath(c)).toBe('notes/My Idea.md');
  });
});

describe('defaultRejectRelativePath', () => {
  it('places under archive/inbox', () => {
    const c = makeCard({ relativePath: 'Inbox/R.md' });
    expect(defaultRejectRelativePath(c)).toBe('archive/inbox/R.md');
  });
});

describe('uniqueRelativePath', () => {
  it('returns candidate when free', () => {
    const taken = new Set(['a/x.md']);
    expect(uniqueRelativePath('notes/y.md', taken)).toBe('notes/y.md');
  });

  it('appends numeric suffix on collision', () => {
    const taken = new Set(['notes/y.md']);
    expect(uniqueRelativePath('notes/y.md', taken)).toBe('notes/y-1.md');
  });
});

describe('buildTakenRelativePaths', () => {
  it('normalizes paths', () => {
    const s = buildTakenRelativePaths([makeCard({ relativePath: 'A\\b.md' })]);
    expect(s.has('A/b.md')).toBe(true);
  });
});

describe('markdown transforms', () => {
  it('buildApprovedMarkdown clears inbox fields and sets type', () => {
    const raw = `---\ntitle: Hi\ninbox: true\nsource: openclaw\nsuggested_path: notes/x.md\ntype: note\n---\n\nBody`;
    const card = makeCard({ id: 'stable_id', relativePath: 'Inbox/x.md' });
    const out = buildApprovedMarkdown(raw, card, 'recipe');
    expect(out).toContain('id: stable_id');
    expect(out).toContain('type: recipe');
    expect(out).not.toMatch(/^inbox:/m);
    expect(out).toContain('Body');
  });

  it('buildRejectedMarkdown marks review_status', () => {
    const raw = `---\ninbox: true\n---\n\nX`;
    const card = makeCard({ id: 'z', relativePath: 'Inbox/x.md' });
    const out = buildRejectedMarkdown(raw, card);
    expect(out).toContain('review_status: rejected');
    expect(out).not.toMatch(/^inbox:/m);
  });
});

describe('normalizeVaultRel', () => {
  it('normalizes backslashes', () => {
    expect(normalizeVaultRel('a\\b\\c.md')).toBe('a/b/c.md');
  });
});
