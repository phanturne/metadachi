import matter from 'gray-matter';
import type { Card } from './types';

/** Rebuild full markdown (frontmatter + body) from a merged card for the demo editor. */
export function serializeCardToMarkdown(card: Card): string {
  return matter.stringify(card.rawContent, {
    id: card.id,
    title: card.title,
    type: card.type,
    created: card.created,
    tags: card.tags,
    pinned: card.pinned,
    favorite: card.favorite,
  });
}
