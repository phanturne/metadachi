import type { Card } from './types';

export type FileTreeNode =
  | { kind: 'root' }
  | { kind: 'folder'; name: string }
  | { kind: 'file'; name: string; cardId: string };

export type VaultTreeModel = {
  rootId: string;
  children: Record<string, string[]>;
  itemData: Record<string, FileTreeNode>;
};

const ROOT = '__root__';

function sortIds(ids: string[], itemData: Record<string, FileTreeNode>): string[] {
  return [...ids].sort((a, b) => {
    const da = itemData[a];
    const db = itemData[b];
    const fa = da?.kind === 'folder' || da?.kind === 'root' ? 0 : 1;
    const fb = db?.kind === 'folder' || db?.kind === 'root' ? 0 : 1;
    if (fa !== fb) return fa - fb;
    const na = da && da.kind !== 'root' ? da.name : a;
    const nb = db && db.kind !== 'root' ? db.name : b;
    return na.localeCompare(nb, undefined, { sensitivity: 'base' });
  });
}

export function buildVaultTreeModel(cards: Card[]): VaultTreeModel {
  const children: Record<string, string[]> = { [ROOT]: [] };
  const itemData: Record<string, FileTreeNode> = {
    [ROOT]: { kind: 'root' },
  };

  const ensureChild = (parentId: string, childId: string) => {
    if (!children[parentId]) children[parentId] = [];
    if (!children[parentId].includes(childId)) {
      children[parentId].push(childId);
    }
  };

  for (const card of cards) {
    const rel = card.relativePath;
    const parts = rel.split('/').filter(Boolean);
    if (parts.length === 0) continue;

    let parentId = ROOT;
    for (let i = 0; i < parts.length - 1; i++) {
      const folderId = parts.slice(0, i + 1).join('/');
      if (!itemData[folderId]) {
        itemData[folderId] = { kind: 'folder', name: parts[i] };
      }
      ensureChild(parentId, folderId);
      parentId = folderId;
    }

    const fileName = parts[parts.length - 1];
    const fileId = rel;
    if (!itemData[fileId]) {
      itemData[fileId] = { kind: 'file', name: fileName, cardId: card.id };
    }
    ensureChild(parentId, fileId);
  }

  const sortedChildren: Record<string, string[]> = {};
  for (const id of Object.keys(children)) {
    sortedChildren[id] = sortIds(children[id], itemData);
  }

  return { rootId: ROOT, children: sortedChildren, itemData };
}

/** Folder node ids (vault-relative), excluding the synthetic root. */
export function listFolderIds(model: VaultTreeModel): string[] {
  return Object.entries(model.itemData)
    .filter(([, node]) => node.kind === 'folder')
    .map(([id]) => id)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
