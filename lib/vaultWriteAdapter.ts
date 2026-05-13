import { clearDemoOverlay, loadDemoOverlay, saveDemoOverlay } from '@/lib/demoStorage';
import type { VaultMode } from '@/lib/vaultMode';
import type { FamiliarityLevel } from '@/lib/srs';

export type TogglePinInput = { id: string; pinned: boolean };
export type ToggleFavoriteInput = { id: string; favorite: boolean };
export type TogglePublishedInput = { id: string; published: boolean };
export type ToggleDeckPublishedInput = { deck: string; published: boolean };
export type SaveFileInput = { id: string; relativePath: string; raw: string };
export type DeleteFileInput = { id: string; relativePath: string };
export type RelocateFileInput = { id: string; fromRelativePath: string; toRelativePath: string };

export type CreateFlashcardInput = {
  front: string;
  back: string;
  deck?: string;
  tags?: string[];
  difficulty?: string;
  category?: string;
};

export type UpdateLastReviewedInput = {
  id: string;
  relativePath: string;
  lastReviewedAt: string;
};

export type UpdateFamiliarityLevelInput = {
  id: string;
  relativePath: string;
  familiarity_level: FamiliarityLevel;
};

export type UpdateFlashcardInput = {
  id: string;
  relativePath: string;
  front: string;
  back: string;
  deck?: string;
  tags?: string[];
  difficulty?: string;
  category?: string;
};

const DEMO_LOCAL_STORAGE_KEY = 'metadachi-demo-state';

function getDemoState(): Record<string, { pinned?: boolean; favorite?: boolean }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DEMO_LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function updateDemoState(id: string, updates: { pinned?: boolean; favorite?: boolean }) {
  if (typeof window === 'undefined') return;
  const state = getDemoState();
  state[id] = { ...state[id], ...updates };
  localStorage.setItem(DEMO_LOCAL_STORAGE_KEY, JSON.stringify(state));
}

async function assertOkOrThrow(res: Response, fallbackMessage: string) {
  if (res.ok) return;
  const errText = await res.text().catch(() => '');
  throw new Error(errText || fallbackMessage);
}

export type VaultWriteAdapter = {
  togglePin(input: TogglePinInput): Promise<void>;
  toggleFavorite(input: ToggleFavoriteInput): Promise<void>;
  togglePublished(input: TogglePublishedInput): Promise<void>;
  toggleDeckPublished(input: ToggleDeckPublishedInput): Promise<void>;
  saveVaultFile(input: SaveFileInput): Promise<void>;
  addVaultFile(): Promise<string | undefined>;
  removeVaultFile(input: DeleteFileInput): Promise<void>;
  relocateVaultFile(input: RelocateFileInput): Promise<void>;
  resetDemoOverlay(): Promise<void>;
  createFlashcard(input: CreateFlashcardInput): Promise<string>;
  updateFlashcard(input: UpdateFlashcardInput): Promise<void>;
  updateLastReviewed(input: UpdateLastReviewedInput): Promise<void>;
  updateFamiliarityLevel(input: UpdateFamiliarityLevelInput): Promise<void>;
};

function createDemoAdapter(): VaultWriteAdapter {
  return {
    async togglePin({ id, pinned }) {
      updateDemoState(id, { pinned });
      const overlay = await loadDemoOverlay();
      await saveDemoOverlay({
        ...overlay,
        pinFavoriteById: {
          ...overlay.pinFavoriteById,
          [id]: { ...overlay.pinFavoriteById[id], pinned },
        },
      });
    },
    async toggleFavorite({ id, favorite }) {
      updateDemoState(id, { favorite });
      const overlay = await loadDemoOverlay();
      await saveDemoOverlay({
        ...overlay,
        pinFavoriteById: {
          ...overlay.pinFavoriteById,
          [id]: { ...overlay.pinFavoriteById[id], favorite },
        },
      });
    },
    async togglePublished({ id, published }) {
      const overlay = await loadDemoOverlay();
      await saveDemoOverlay({
        ...overlay,
        pinFavoriteById: {
          ...overlay.pinFavoriteById,
          [id]: { ...overlay.pinFavoriteById[id], published },
        },
      });
    },
    async toggleDeckPublished({ deck, published }) {
      const overlay = await loadDemoOverlay();
      await saveDemoOverlay({
        ...overlay,
        publishedDecks: {
          ...overlay.publishedDecks,
          [deck]: published,
        },
      });
    },
    async saveVaultFile({ id, relativePath, raw }) {
      const overlay = await loadDemoOverlay();
      if (relativePath.startsWith('__demo__/')) {
        await saveDemoOverlay({
          ...overlay,
          virtualFiles: overlay.virtualFiles.map(vf =>
            vf.relativePath === relativePath ? { ...vf, raw } : vf
          ),
        });
        return;
      }
      await saveDemoOverlay({
        ...overlay,
        contentByCardId: { ...overlay.contentByCardId, [id]: raw },
      });
    },
    async addVaultFile() {
      const overlay = await loadDemoOverlay();
      const noteId = crypto.randomUUID();
      const relativePath = `__demo__/note-${noteId}.md`;
      const raw = `---\nid: ${noteId}\ntitle: New note\ntype: note\n---\n\n# New note\n`;
      await saveDemoOverlay({
        ...overlay,
        virtualFiles: [...overlay.virtualFiles, { relativePath, raw }],
      });
      return relativePath;
    },
    async removeVaultFile({ id, relativePath }) {
      const overlay = await loadDemoOverlay();
      if (relativePath.startsWith('__demo__/')) {
        await saveDemoOverlay({
          ...overlay,
          virtualFiles: overlay.virtualFiles.filter(vf => vf.relativePath !== relativePath),
        });
        return;
      }
      await saveDemoOverlay({
        ...overlay,
        tombstonedIds: [...new Set([...overlay.tombstonedIds, id])],
      });
    },
    async relocateVaultFile({ id, fromRelativePath, toRelativePath }) {
      const overlay = await loadDemoOverlay();
      if (fromRelativePath.startsWith('__demo__/')) {
        const idx = overlay.virtualFiles.findIndex(vf => vf.relativePath === fromRelativePath);
        if (idx === -1) throw new Error('Virtual file not found');
        const nextVf = [...overlay.virtualFiles];
        nextVf[idx] = { ...nextVf[idx]!, relativePath: toRelativePath };
        await saveDemoOverlay({ ...overlay, virtualFiles: nextVf });
        return;
      }
      await saveDemoOverlay({
        ...overlay,
        renamedByCardId: { ...overlay.renamedByCardId, [id]: toRelativePath },
      });
    },
    async resetDemoOverlay() {
      await clearDemoOverlay();
    },
    async createFlashcard({ front, back, deck = 'default', tags = [], difficulty, category }) {
      const overlay = await loadDemoOverlay();
      const cardId = crypto.randomUUID();
      const relativePath = `__demo__/Flashcards/${cardId}.md`;
      const now = new Date().toISOString();
      const raw = `---\nid: ${cardId}\ntitle: "${front.slice(0, 50)}"\ntype: flashcard\ndeck: ${deck}\ntags: [${tags.map(t => `"${t}"`).join(', ')}]\nfamiliarity_level: new\nlast_reviewed_at: ${now}\ncreated: ${now}\n${difficulty ? `difficulty: ${difficulty}\n` : ''}${category ? `category: ${category}\n` : ''}---\n\nQ: ${front}\nA::::\n\n${back}\n`;
      await saveDemoOverlay({
        ...overlay,
        virtualFiles: [...overlay.virtualFiles, { relativePath, raw }],
        pinFavoriteById: {
          ...overlay.pinFavoriteById,
          [cardId]: { pinned: false, favorite: false },
        },
      });
      return relativePath;
    },
    async updateLastReviewed({ relativePath, lastReviewedAt }) {
      const overlay = await loadDemoOverlay();
      const vf = overlay.virtualFiles.find(vf => vf.relativePath === relativePath);
      if (!vf) throw new Error('Flashcard not found');

      const frontmatterMatch = vf.raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) throw new Error('Invalid frontmatter');

      const [, frontmatterStr, content] = frontmatterMatch;

      let newFrontmatter = frontmatterStr
        .replace(/^last_reviewed_at:.*$/m, `last_reviewed_at: ${lastReviewedAt}`);

      if (!newFrontmatter.includes('last_reviewed_at:')) {
        newFrontmatter += `\nlast_reviewed_at: ${lastReviewedAt}`;
      }

      newFrontmatter = newFrontmatter
        .split('\n')
        .filter((line) => line.trim() !== '')
        .join('\n');

      const newRaw = `---\n${newFrontmatter}\n---\n${content}`;

      await saveDemoOverlay({
        ...overlay,
        virtualFiles: overlay.virtualFiles.map(vf =>
          vf.relativePath === relativePath ? { ...vf, raw: newRaw } : vf
        ),
      });
    },
    async updateFamiliarityLevel({ relativePath, familiarity_level }) {
      const overlay = await loadDemoOverlay();
      const vf = overlay.virtualFiles.find(vf => vf.relativePath === relativePath);
      if (!vf) throw new Error('Flashcard not found');

      const frontmatterMatch = vf.raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) throw new Error('Invalid frontmatter');

      const [, frontmatterStr, content] = frontmatterMatch;

      let newFrontmatter = frontmatterStr
        .replace(/^familiarity_level:.*$/m, `familiarity_level: ${familiarity_level}`);

      if (!newFrontmatter.includes('familiarity_level:')) {
        newFrontmatter += `\nfamiliarity_level: ${familiarity_level}`;
      }

      const newRaw = `---\n${newFrontmatter}\n---\n${content}`;

      await saveDemoOverlay({
        ...overlay,
        virtualFiles: overlay.virtualFiles.map(vf =>
          vf.relativePath === relativePath ? { ...vf, raw: newRaw } : vf
        ),
      });
    },
    async updateFlashcard({ relativePath, front, back, deck, tags, difficulty, category }) {
      const overlay = await loadDemoOverlay();
      const vf = overlay.virtualFiles.find(vf => vf.relativePath === relativePath);
      if (!vf) throw new Error('Flashcard not found');

      const frontmatterMatch = vf.raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) throw new Error('Invalid frontmatter');

      let [, frontmatterStr] = frontmatterMatch;

      // Update deck
      if (deck !== undefined) {
        if (frontmatterStr.includes('deck:')) {
          frontmatterStr = frontmatterStr.replace(/^deck:.*$/m, `deck: ${deck}`);
        } else {
          frontmatterStr += `\ndeck: ${deck}`;
        }
      }

      // Update tags
      if (tags !== undefined) {
        if (frontmatterStr.includes('tags:')) {
          frontmatterStr = frontmatterStr.replace(/^tags:.*$/m, `tags: [${tags.map(t => `"${t}"`).join(', ')}]`);
        } else if (tags.length > 0) {
          frontmatterStr += `\ntags: [${tags.map(t => `"${t}"`).join(', ')}]`;
        }
      }

      // Update difficulty
      if (difficulty !== undefined) {
        if (frontmatterStr.includes('difficulty:')) {
          frontmatterStr = frontmatterStr.replace(/^difficulty:.*$/m, difficulty ? `difficulty: ${difficulty}` : '');
        } else if (difficulty) {
          frontmatterStr += `\ndifficulty: ${difficulty}`;
        }
      }

      // Update category
      if (category !== undefined) {
        if (frontmatterStr.includes('category:')) {
          frontmatterStr = frontmatterStr.replace(/^category:.*$/m, category ? `category: ${category}` : '');
        } else if (category) {
          frontmatterStr += `\ncategory: ${category}`;
        }
      }

      // Clean up empty frontmatter lines and update title
      const titleMatch = frontmatterStr.match(/^title:.*$/m);
      if (titleMatch) {
        frontmatterStr = frontmatterStr.replace(/^title:.*$/m, `title: "${front.slice(0, 50)}"`);
      }

      const newContent = `Q: ${front}\nA::::\n\n${back}`;
      const newRaw = `---\n${frontmatterStr}\n---\n${newContent}`;

      await saveDemoOverlay({
        ...overlay,
        virtualFiles: overlay.virtualFiles.map(vf =>
          vf.relativePath === relativePath ? { ...vf, raw: newRaw } : vf
        ),
      });
    },
  };
}

function createLiveAdapter(): VaultWriteAdapter {
  return {
    async togglePin({ id, pinned }) {
      const res = await fetch('/api/vault/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pinned }),
      });
      await assertOkOrThrow(res, 'Failed to toggle pin');
    },
    async toggleFavorite({ id, favorite }) {
      const res = await fetch('/api/vault/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, favorite }),
      });
      await assertOkOrThrow(res, 'Failed to toggle favorite');
    },
    async togglePublished({ id, published }) {
      const res = await fetch('/api/vault/published', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published }),
      });
      await assertOkOrThrow(res, 'Failed to toggle published');
    },
    async toggleDeckPublished({ deck, published }) {
      const res = await fetch('/api/vault/deck-published', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck, published }),
      });
      await assertOkOrThrow(res, 'Failed to toggle deck publish');
    },
    async saveVaultFile({ relativePath, raw }) {
      const res = await fetch('/api/vault/file', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath, raw }),
      });
      await assertOkOrThrow(res, 'Failed to save file');
    },
    async addVaultFile() {
      const res = await fetch('/api/vault/file', { method: 'POST' });
      await assertOkOrThrow(res, 'Failed to create file');
      const json = (await res.json()) as { relativePath?: string };
      if (!json.relativePath) throw new Error('Invalid create response');
      return json.relativePath;
    },
    async removeVaultFile({ relativePath }) {
      const qs = new URLSearchParams({ relativePath });
      const res = await fetch(`/api/vault/file?${qs}`, { method: 'DELETE' });
      await assertOkOrThrow(res, 'Failed to delete file');
    },
    async relocateVaultFile({ fromRelativePath, toRelativePath }) {
      const res = await fetch('/api/vault/file', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromRelativePath, toRelativePath }),
      });
      await assertOkOrThrow(res, 'Failed to rename or move file');
    },
    async resetDemoOverlay() {
      // No-op in live mode.
    },
    async createFlashcard({ front, back, deck = 'default', tags = [], difficulty, category }) {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front, back, deck, tags, difficulty, category }),
      });
      await assertOkOrThrow(res, 'Failed to create flashcard');
      const json = (await res.json()) as { relativePath?: string };
      return json.relativePath || '';
    },
    async updateLastReviewed({ relativePath, lastReviewedAt }) {
      const res = await fetch('/api/flashcards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath, last_reviewed_at: lastReviewedAt }),
      });
      await assertOkOrThrow(res, 'Failed to update last reviewed');
    },
    async updateFamiliarityLevel({ relativePath, familiarity_level }) {
      const res = await fetch('/api/flashcards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath, familiarity_level }),
      });
      await assertOkOrThrow(res, 'Failed to update familiarity level');
    },
    async updateFlashcard({ relativePath, front, back, deck, tags, difficulty, category }) {
      const res = await fetch('/api/flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relativePath, front, back, deck, tags, difficulty, category }),
      });
      await assertOkOrThrow(res, 'Failed to update flashcard');
    },
  };
}

export function getVaultWriteAdapter(mode: VaultMode): VaultWriteAdapter {
  return mode === 'demo' ? createDemoAdapter() : createLiveAdapter();
}