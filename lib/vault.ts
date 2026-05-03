import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { Card, CardMeta, CardType, VaultConfig, VaultFile } from './types';
import { getVaultMode } from './vaultMode';

const isDemoMode = getVaultMode() === 'demo';
const rawVaultPath = (isDemoMode ? (process.env.DEMO_VAULT_PATH || './demo-vault') : process.env.VAULT_PATH) || '';

const resolvedVaultBase = path.resolve(process.cwd(), rawVaultPath);

/** One physical path per file on case-insensitive volumes (e.g. APFS default). */
export function canonicalVaultFilePath(filePath: string): string {
  try {
    return fs.realpathSync.native(filePath);
  } catch {
    return path.resolve(filePath);
  }
}

const VAULT_PATH = fs.existsSync(resolvedVaultBase)
  ? canonicalVaultFilePath(resolvedVaultBase)
  : resolvedVaultBase;

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
    const resolvedPath = canonicalVaultFilePath(filePath);
    const raw = fs.readFileSync(resolvedPath, 'utf-8');
    const { data, content } = matter(raw);
    const stats = fs.statSync(resolvedPath);

    const type = inferType(resolvedPath, content, data, config);

    const meta: CardMeta = {
      id: (data.id as string) || generateId(resolvedPath),
      type,
      title: (data.title as string) || path.basename(resolvedPath, '.md'),
      created: (data.created as string) || stats.birthtime.toISOString(),
      tags: (data.tags as string[]) || [],
      pinned: (data.pinned as boolean) || false,
      favorite: (data.favorite as boolean) || false,
      inbox: typeof data.inbox === 'boolean' ? data.inbox : undefined,
      source: typeof data.source === 'string' ? data.source : undefined,
      suggested_path: typeof data.suggested_path === 'string' ? data.suggested_path : undefined,
      published: typeof data.published === 'boolean' ? data.published : false,
      slug: typeof data.slug === 'string' ? data.slug : undefined,
      author: typeof data.author === 'string' ? data.author : undefined,
    };

    return { path: resolvedPath, meta, rawContent: content.trim() };
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
  /** Prevents symlink cycles / revisiting the same directory on case-insensitive FS. */
  const visitedDirs = new Set<string>();

  function walk(dir: string) {
    let dirKey: string;
    try {
      dirKey = fs.realpathSync.native(dir);
    } catch {
      dirKey = path.resolve(dir);
    }
    if (visitedDirs.has(dirKey)) return;
    visitedDirs.add(dirKey);

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      // Do not follow symlinks: avoids infinite recursion, huge trees, and blocking the Node event loop.
      if (entry.isSymbolicLink()) continue;
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
    relativePath: path.relative(VAULT_PATH, f.path).replace(/\\/g, '/'),
  }));
}

export { VAULT_PATH };
