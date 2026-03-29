import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Card, CardMeta, VaultFile, CardType } from './types';

const VAULT_PATH = process.env.VAULT_PATH || '';

function generateId(filePath: string): string {
  // Use relative path as stable ID
  return filePath.replace(/[^a-zA-Z0-9]/g, '_');
}

function inferType(filePath: string, content: string, frontmatter: Record<string, unknown>): CardType {
  if (frontmatter.type && typeof frontmatter.type === 'string') {
    return frontmatter.type as CardType;
  }
  // Infer from path
  const relative = path.relative(VAULT_PATH, filePath);
  if (relative.startsWith('recipes') || relative.includes('/recipes/')) {
    return 'recipe';
  }
  if (relative.startsWith('meetings') || content.includes('## Meeting')) {
    return 'meeting';
  }
  return 'default';
}

function parseFile(filePath: string): VaultFile | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const stats = fs.statSync(filePath);
    
    const type = inferType(filePath, content, data);
    
    const meta: CardMeta = {
      id: (data.id as string) || generateId(filePath),
      type,
      title: (data.title as string) || path.basename(filePath, '.md'),
      created: (data.created as string) || stats.birthtime.toISOString(),
      tags: (data.tags as string[]) || [],
      pinned: (data.pinned as boolean) || false,
    };

    return { path: filePath, meta, rawContent: content.trim() };
  } catch {
    return null;
  }
}

export function readVault(): VaultFile[] {
  if (!fs.existsSync(VAULT_PATH)) {
    return [];
  }

  const files: VaultFile[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const parsed = parseFile(full);
        if (parsed) files.push(parsed);
      }
    }
  }

  walk(VAULT_PATH);
  return files;
}

export function cardsFromVault(files: VaultFile[]): Card[] {
  return files.map(f => ({
    ...f.meta,
    rawContent: f.rawContent,
    filePath: f.path,
  }));
}

export { VAULT_PATH };
