import matter from 'gray-matter';
import path from 'path';
import { Card, CardMeta, VaultConfig } from './types';
import { inferCardType } from './inferCardType';
import { generateIdFromPath } from './id';

export function cardFromRawMarkdown(
  raw: string,
  relativePath: string,
  config: VaultConfig,
  createdFallback?: string
): Card | null {
  try {
    const { data, content } = matter(raw);
    const fm = data as Record<string, unknown>;
    const body = typeof content === 'string' ? content.trim() : '';
    const type = inferCardType(relativePath, body, fm, config);
    const id = (fm.id as string) || generateIdFromPath(relativePath);
    const meta: CardMeta = {
      id,
      type,
      title: (fm.title as string) || path.basename(relativePath, '.md'),
      created: (fm.created as string) || createdFallback || new Date().toISOString(),
      tags: (fm.tags as string[]) || [],
      pinned: (fm.pinned as boolean) || false,
      favorite: (fm.favorite as boolean) || false,
      inbox: typeof fm.inbox === 'boolean' ? fm.inbox : undefined,
      source: typeof fm.source === 'string' ? fm.source : undefined,
      suggested_path: typeof fm.suggested_path === 'string' ? fm.suggested_path : undefined,
    };
    return {
      ...meta,
      rawContent: body,
      filePath: relativePath,
      relativePath,
    };
  } catch {
    return null;
  }
}
