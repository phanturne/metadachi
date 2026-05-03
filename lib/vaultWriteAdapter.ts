import { clearDemoOverlay, loadDemoOverlay, saveDemoOverlay } from '@/lib/demoStorage';
import type { VaultMode } from '@/lib/vaultMode';

export type TogglePinInput = { id: string; pinned: boolean };
export type ToggleFavoriteInput = { id: string; favorite: boolean };
export type TogglePublishedInput = { id: string; published: boolean };
export type SaveFileInput = { id: string; relativePath: string; raw: string };
export type DeleteFileInput = { id: string; relativePath: string };
export type RelocateFileInput = { id: string; fromRelativePath: string; toRelativePath: string };

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
  saveVaultFile(input: SaveFileInput): Promise<void>;
  addVaultFile(): Promise<string | undefined>;
  removeVaultFile(input: DeleteFileInput): Promise<void>;
  relocateVaultFile(input: RelocateFileInput): Promise<void>;
  resetDemoOverlay(): Promise<void>;
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
      // Demo mode doesn't really have a "hub", but we track the state anyway
      const overlay = await loadDemoOverlay();
      await saveDemoOverlay({
        ...overlay,
        pinFavoriteById: {
          ...overlay.pinFavoriteById,
          [id]: { ...overlay.pinFavoriteById[id], published },
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
  };
}

export function getVaultWriteAdapter(mode: VaultMode): VaultWriteAdapter {
  return mode === 'demo' ? createDemoAdapter() : createLiveAdapter();
}
