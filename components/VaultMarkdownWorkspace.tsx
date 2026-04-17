'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Folder, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useVault } from '@/hooks/useVault';
import type { Card } from '@/lib/types';
import { VaultFileTree } from '@/components/VaultFileTree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadDemoOverlay } from '@/lib/demoStorage';
import { getDemoEditorSource } from '@/lib/demoEditorSource';
import { serializeCardToMarkdown } from '@/lib/serializeCardMarkdown';
import { buildVaultTreeModel, listFolderIds } from '@/lib/vaultTreeModel';
import { basenameRel, dirnameRel, joinRel } from '@/lib/relPath';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type VaultMarkdownWorkspaceProps = {
  /** Usually the same filtered set as card view (search + type). */
  cards: Card[];
};

export function VaultMarkdownWorkspace({ cards }: VaultMarkdownWorkspaceProps) {
  const {
    mode,
    capabilities,
    saveVaultFileAsync,
    addVaultFile,
    removeVaultFile,
    relocateVaultFileAsync,
    resetDemoOverlay,
    vaultFileBusy,
    allCards,
  } = useVault();
  const isDemoMode = mode === 'demo';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [savedBaseline, setSavedBaseline] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [renameBasename, setRenameBasename] = useState('');
  const [moveTargetFolder, setMoveTargetFolder] = useState('');
  const [relocateError, setRelocateError] = useState<string | null>(null);

  const selected = cards.find(c => c.id === selectedId) ?? null;

  const folderModel = useMemo(() => buildVaultTreeModel(allCards), [allCards]);
  const folderOptions = useMemo(() => {
    const ids = listFolderIds(folderModel);
    return [{ id: '', label: '(vault root)' }, ...ids.map(id => ({ id, label: id }))];
  }, [folderModel]);

  const reloadDraft = useCallback(async () => {
    if (!selected) {
      setDraft('');
      setSavedBaseline('');
      return;
    }
    setDraftLoading(true);
    try {
      let content = '';
      if (isDemoMode) {
        const overlay = await loadDemoOverlay();
        content = getDemoEditorSource(selected, overlay);
      } else {
        content = serializeCardToMarkdown(selected);
      }
      setDraft(content);
      setSavedBaseline(content);
    } finally {
      setDraftLoading(false);
    }
  }, [selected, isDemoMode]);

  useEffect(() => {
    void reloadDraft();
  }, [reloadDraft]);

  useEffect(() => {
    if (selectedId && !cards.some(c => c.id === selectedId)) {
      setSelectedId(null);
    }
  }, [cards, selectedId]);

  const isDirty = Boolean(selected && !draftLoading && draft !== savedBaseline);

  const handleSave = async () => {
    if (!selected || !isDirty) return;
    try {
      await saveVaultFileAsync(selected.id, selected.relativePath, draft);
      setSavedBaseline(draft);
    } catch {
      /* toast optional */
    }
  };

  const handleRemove = () => {
    if (!selected) return;
    if (!capabilities.canDeleteFile) return;
    removeVaultFile(selected.id, selected.relativePath);
    setSelectedId(null);
  };

  const openRename = () => {
    if (!selected) return;
    if (!capabilities.canRelocateFile) return;
    setRenameBasename(basenameRel(selected.relativePath));
    setRelocateError(null);
    setRenameOpen(true);
  };

  const openMove = () => {
    if (!selected) return;
    if (!capabilities.canRelocateFile) return;
    setMoveTargetFolder(dirnameRel(selected.relativePath));
    setRelocateError(null);
    setMoveOpen(true);
  };

  const submitRename = async () => {
    if (!selected) return;
    if (!capabilities.canRelocateFile) return;
    const name = renameBasename.trim();
    if (!name || !name.endsWith('.md')) {
      setRelocateError('File name must end with .md');
      return;
    }
    const toRel = joinRel(dirnameRel(selected.relativePath), name);
    if (toRel === selected.relativePath) {
      setRenameOpen(false);
      return;
    }
    try {
      await relocateVaultFileAsync(selected.id, selected.relativePath, toRel);
      setRenameOpen(false);
    } catch (e) {
      setRelocateError(e instanceof Error ? e.message : 'Rename failed');
    }
  };

  const submitMove = async () => {
    if (!selected) return;
    if (!capabilities.canRelocateFile) return;
    const base = basenameRel(selected.relativePath);
    const toRel = joinRel(moveTargetFolder, base);
    if (toRel === selected.relativePath) {
      setMoveOpen(false);
      return;
    }
    try {
      await relocateVaultFileAsync(selected.id, selected.relativePath, toRel);
      setMoveOpen(false);
    } catch (e) {
      setRelocateError(e instanceof Error ? e.message : 'Move failed');
    }
  };

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <p className="shrink-0 text-sm text-muted-foreground">
        {isDemoMode
          ? 'Edits and new files stay in this browser only. Nothing is written to the server or shared with others.'
          : 'Save writes markdown files to your configured vault on disk. Remove deletes files from disk.'}
      </p>

      <div className="grid h-[calc(100svh-var(--vault-chrome-offset))] min-h-[22rem] grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border border-border bg-card/30 md:grid-rows-1 md:grid-cols-[minmax(220px,320px)_1fr]">
        <div className="flex min-h-0 flex-col gap-2 border-border p-4 md:border-r">
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => addVaultFile()}>
              <Plus className="size-3.5" />
              New note
            </Button>
            {capabilities.canResetOverlay && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1 text-muted-foreground"
                onClick={() => {
                  resetDemoOverlay();
                  setSelectedId(null);
                }}
              >
                <RotateCcw className="size-3.5" />
                Reset local overlay
              </Button>
            )}
          </div>
          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files match the current filters.</p>
          ) : (
            <div className="min-h-0 flex-1">
              <VaultFileTree cards={cards} onSelectFile={setSelectedId} />
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-3 p-4">
          {selected ? (
            <>
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
                <p className="truncate text-xs text-muted-foreground font-mono">{selected.relativePath}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={openRename}
                    disabled={!capabilities.canRelocateFile}
                    title={!capabilities.canRelocateFile ? 'Rename is unavailable in this mode.' : undefined}
                  >
                    Rename…
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={openMove}
                    disabled={!capabilities.canRelocateFile}
                    title={!capabilities.canRelocateFile ? 'Move is unavailable in this mode.' : undefined}
                  >
                    <Folder className="size-3.5" />
                    Move…
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    onClick={handleRemove}
                    disabled={!capabilities.canDeleteFile}
                    title={!capabilities.canDeleteFile ? 'Delete is unavailable in this mode.' : undefined}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1"
                    onClick={() => void handleSave()}
                    disabled={vaultFileBusy || draftLoading || !isDirty}
                  >
                    <Save className="size-3.5" />
                    Save
                  </Button>
                </div>
              </div>
              {draftLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  className="min-h-[12rem] flex-1 resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  spellCheck={false}
                  aria-label="Markdown source"
                />
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a file in the tree to edit.</p>
          )}
        </div>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>New file name (keep .md). Stays in the same folder.</DialogDescription>
          </DialogHeader>
          <Input
            value={renameBasename}
            onChange={e => setRenameBasename(e.target.value)}
            aria-label="New file name"
            className="font-mono text-sm"
          />
          {relocateError && <p className="text-sm text-destructive">{relocateError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitRename()} disabled={vaultFileBusy}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move file</DialogTitle>
            <DialogDescription>Choose a folder. The file name stays the same.</DialogDescription>
          </DialogHeader>
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted-foreground">Destination folder</span>
            <select
              className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm font-mono outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={moveTargetFolder}
              onChange={e => setMoveTargetFolder(e.target.value)}
              aria-label="Destination folder"
            >
              {folderOptions.map(opt => (
                <option key={opt.id || 'root'} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          {relocateError && <p className="text-sm text-destructive">{relocateError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMoveOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void submitMove()} disabled={vaultFileBusy}>
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
