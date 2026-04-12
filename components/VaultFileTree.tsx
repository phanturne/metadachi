'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTree } from '@headless-tree/react';
import {
  syncDataLoaderFeature,
  selectionFeature,
  hotkeysCoreFeature,
} from '@headless-tree/core';
import { ChevronRight, FileText, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Card } from '@/lib/types';
import { buildVaultTreeModel, type FileTreeNode } from '@/lib/vaultTreeModel';

export type VaultFileTreeProps = {
  cards: Card[];
  onSelectFile: (cardId: string) => void;
};

type TreeUiState = {
  expandedItems: string[];
  selectedItems: string[];
  focusedItem: string | null;
};

function VaultFileTreeInner({ cards, onSelectFile }: VaultFileTreeProps) {
  const model = useMemo(() => buildVaultTreeModel(cards), [cards]);

  const [treeUi, setTreeUi] = useState<TreeUiState>(() => ({
    expandedItems: [model.rootId],
    selectedItems: [],
    focusedItem: null,
  }));

  const tree = useTree<FileTreeNode>({
    state: treeUi,
    setState: u =>
      setTreeUi(prev => {
        const patch = typeof u === 'function' ? (u as (s: TreeUiState) => Partial<TreeUiState>)(prev) : u;
        return { ...prev, ...patch };
      }),
    rootItemId: model.rootId,
    indent: 14,
    dataLoader: {
      getItem: (itemId: string) => {
        const d = model.itemData[itemId];
        if (d) return d;
        return { kind: 'root' as const };
      },
      getChildren: (itemId: string) => model.children[itemId] ?? [],
    },
    getItemName: item => {
      const d = item.getItemData();
      if (d.kind === 'root') return 'Vault';
      return d.name;
    },
    isItemFolder: item => item.getItemData().kind !== 'file',
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
    onPrimaryAction: item => {
      const d = item.getItemData();
      if (d.kind === 'file') {
        onSelectFile(d.cardId);
      }
    },
  });

  useEffect(() => {
    tree.rebuildTree();
  }, [tree, model]);

  return (
    <div
      {...tree.getContainerProps('Vault files')}
      className="h-full min-h-0 overflow-y-auto overscroll-contain rounded-lg border border-border bg-muted/30 p-1 text-left text-sm"
    >
      {tree.getItems().map(item => {
        const meta = item.getItemMeta();
        const isFolder = item.isFolder();
        const id = item.getId();
        const testId = `vault-file-item-${id.replace(/[/\\]/g, '__')}`;
        return (
          <button
            key={id}
            type="button"
            data-testid={testId}
            {...item.getProps()}
            className={cn(
              'flex w-full items-center gap-1 rounded-md px-1.5 py-1 text-left text-foreground outline-none',
              'hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring',
              item.isFocused() && 'bg-muted',
              item.isSelected() && 'bg-muted'
            )}
            style={{ paddingLeft: 6 + meta.level * 14 }}
          >
            {isFolder ? (
              <ChevronRight
                className={cn(
                  'size-3.5 shrink-0 text-muted-foreground transition-transform',
                  item.isExpanded() && 'rotate-90'
                )}
                aria-hidden
              />
            ) : (
              <span className="inline-block w-3.5 shrink-0" aria-hidden />
            )}
            {isFolder ? (
              <Folder className="size-3.5 shrink-0 text-amber-500/90" aria-hidden />
            ) : (
              <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className="min-w-0 truncate">{item.getItemName()}</span>
          </button>
        );
      })}
    </div>
  );
}

export function VaultFileTree(props: VaultFileTreeProps) {
  return <VaultFileTreeInner {...props} />;
}
