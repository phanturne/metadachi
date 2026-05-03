import matter from 'gray-matter';
import type { Card } from './types';

/** Rebuild full markdown (frontmatter + body) from a merged card for the demo editor. */
export function serializeCardToMarkdown(card: Card): string {
  const metadata: any = {
    id: card.id,
    title: card.title,
    type: card.type,
    created: card.created,
    tags: card.tags,
    pinned: card.pinned,
    favorite: card.favorite,
  };

  if (card.published !== undefined) metadata.published = card.published;
  if (card.slug !== undefined) metadata.slug = card.slug;
  if (card.author !== undefined) metadata.author = card.author;

  return matter.stringify(card.rawContent, metadata);
}
