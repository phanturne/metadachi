import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Card, CardMeta, VaultFile, CardType, VaultConfig } from './types';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const rawVaultPath = (isDemoMode ? (process.env.DEMO_VAULT_PATH || './demo-vault') : process.env.VAULT_PATH) || '';

const VAULT_PATH = path.resolve(process.cwd(), rawVaultPath);

function generateId(filePath: string): string {
  // Use relative path as stable ID
  return filePath.replace(/[^a-zA-Z0-9]/g, '_');
}

const METADACHI_DIR = path.join(VAULT_PATH, '.metadachi');
const CONFIG_FILE = path.join(METADACHI_DIR, 'config.json');

const DEFAULT_CONFIG: VaultConfig = {
  types: [
    { id: 'recipe', label: 'Recipes', inferFromPath: 'recipes/' },
    { id: 'meeting', label: 'Meetings', inferFromContent: '## Meeting' },
    { id: 'note', label: 'Notes' },
    { id: 'reference', label: 'Reference' },
    { id: 'default', label: 'Other' },
  ],
  filterBarOrder: ['all', 'recipe', 'meeting', 'note', 'reference', 'default'],
};

export function getVaultConfig(): VaultConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    if (!fs.existsSync(METADACHI_DIR)) {
      fs.mkdirSync(METADACHI_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return DEFAULT_CONFIG;
  }
  try {
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as VaultConfig;
  } catch (e) {
    console.warn(`[vault] Failed to parse config.json: ${(e as Error).message}`);
    return DEFAULT_CONFIG;
  }
}

function inferType(filePath: string, content: string, frontmatter: Record<string, unknown>, config: VaultConfig): CardType {
  if (frontmatter.type && typeof frontmatter.type === 'string') {
    return frontmatter.type;
  }
  // Infer dynamically from config
  const relative = path.relative(VAULT_PATH, filePath);
  if (config.types) {
    for (const t of config.types) {
      if (t.inferFromPath && (relative.startsWith(t.inferFromPath) || relative.includes('/' + t.inferFromPath))) {
        return t.id;
      }
      if (t.inferFromContent && content.includes(t.inferFromContent)) {
        return t.id;
      }
    }
  }
  return 'default';
}

export function parseFile(filePath: string, config: VaultConfig): VaultFile | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const stats = fs.statSync(filePath);
    
    const type = inferType(filePath, content, data, config);
    
    const meta: CardMeta = {
      id: (data.id as string) || generateId(filePath),
      type,
      title: (data.title as string) || path.basename(filePath, '.md'),
      created: (data.created as string) || stats.birthtime.toISOString(),
      tags: (data.tags as string[]) || [],
      pinned: (data.pinned as boolean) || false,
      favorite: (data.favorite as boolean) || false,
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

  const config = getVaultConfig();

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '.metadachi') {
          walk(full);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const parsed = parseFile(full, config);
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
