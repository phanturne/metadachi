import chokidar, { FSWatcher } from 'chokidar';
import { parseFile, readVault, VAULT_PATH, getVaultConfig, canonicalVaultFilePath } from './vault';
import { VaultFile } from './types';
import { getStates } from './stateDb';
import { EventEmitter } from 'events';

// Prevent multiple instances in development
const globalForVaultCache = globalThis as unknown as {
  vaultCache: VaultCacheSingleton | undefined;
};

class VaultCacheSingleton {
  public files: Map<string, VaultFile> = new Map();
  public events = new EventEmitter();
  private isReady: boolean = false;
  private watcher: FSWatcher | null = null;
  private syncDone: boolean = false;
  private updateEmitTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (!VAULT_PATH) return;

    if (!this.syncDone) {
      console.log('[VaultCache] Synchronously populating cache...');
      const initialFiles = readVault();
      const states = getStates();
      
      for (const f of initialFiles) {
        const state = states[f.meta.id];
        if (state) {
           if (state.pinned !== undefined) f.meta.pinned = state.pinned;
           if (state.favorite !== undefined) f.meta.favorite = state.favorite;
        }
        this.files.set(f.path, f);
      }
      this.syncDone = true;
      this.isReady = true;
      console.log(`[VaultCache] Loaded ${this.files.size} files in memory.`);
    }

    this.watcher = chokidar.watch(VAULT_PATH, {
      ignored: (filePath: string) => {
        // Ignore dotfiles/dotdirectories EXCEPT .metadachi
        const basename = filePath.split(/[\\/]/).pop();
        if (!basename) return false;
        // Don't ignore the .metadachi folder or files inside it.
        // Match only a path segment literally named ".metadachi".
        const inMetadachiDir = /(^|[\\/])\.metadachi([\\/]|$)/.test(filePath);
        if (inMetadachiDir) return false;
        return basename.startsWith('.');
      },
      persistent: true,
      ignoreInitial: true // Initial reads were done synchronously
    });

    this.watcher
      .on('add', (filePath: string) => this.handleFileEvent(filePath))
      .on('change', (filePath: string) => this.handleFileEvent(filePath))
      .on('unlink', (filePath: string) => this.handleFileRemove(filePath));
  }

  /** Coalesce rapid FS events so the Node thread is not saturated and SSE clients are not flooded. */
  private emitUpdate() {
    if (this.updateEmitTimer) return;
    this.updateEmitTimer = setTimeout(() => {
      this.updateEmitTimer = null;
      this.events.emit('update');
    }, 100);
  }

  private handleFileEvent(filePath: string) {
    if (filePath.endsWith('state.json') || filePath.endsWith('.metadachi.json')) {
      console.log('[VaultCache] State updated, applying states...');
      const states = getStates();
      for (const [path, file] of this.files.entries()) {
        const state = states[file.meta.id] || {};
        // If state changed manually, we must update the cache object
        // Notice we apply both truthy and falsy values here since it could be toggled off manually
        file.meta.pinned = state.pinned ?? false;
        file.meta.favorite = state.favorite ?? false;
        this.files.set(path, file);
      }
      this.emitUpdate();
      return;
    }

    if (filePath.endsWith('config.json')) {
      console.log('[VaultCache] config.json updated, re-evaluating core types... (this usually requires full reload of data, emitting update)');
      // For now, we will just clear and reload or let the client refetch.
      // Easiest is to force a re-read of the vault files, but let's just re-parse what we have
      const config = getVaultConfig();
      for (const [p, file] of this.files.entries()) {
          const freshParse = parseFile(p, config);
          if (freshParse) {
             freshParse.meta.pinned = file.meta.pinned;
             freshParse.meta.favorite = file.meta.favorite;
             this.files.set(p, freshParse);
          }
      }
      this.emitUpdate();
      return;
    }

    if (!filePath.endsWith('.md')) return;
    const config = getVaultConfig();
    const parsed = parseFile(filePath, config);
    if (parsed) {
      const states = getStates();
      const state = states[parsed.meta.id];
      if (state && state.pinned !== undefined) {
         parsed.meta.pinned = state.pinned;
      }
      if (state && state.favorite !== undefined) {
         parsed.meta.favorite = state.favorite;
      }
      this.files.set(parsed.path, parsed);
      this.emitUpdate();
    }
  }

  private handleFileRemove(filePath: string) {
    const key = canonicalVaultFilePath(filePath);
    if (this.files.has(key)) {
      this.files.delete(key);
      this.emitUpdate();
    }
  }

  public getVaultFiles(): VaultFile[] {
    return Array.from(this.files.values());
  }

  public updateState(id: string, stateUpdate: any) {
    for (const [path, file] of this.files.entries()) {
      if (file.meta.id === id) {
        if (stateUpdate.pinned !== undefined) {
          file.meta.pinned = stateUpdate.pinned;
        }
        if (stateUpdate.favorite !== undefined) {
          file.meta.favorite = stateUpdate.favorite;
        }
        this.files.set(path, file);
        break; // IDs are unique
      }
    }
  }
}

export const vaultCache = globalForVaultCache.vaultCache || new VaultCacheSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForVaultCache.vaultCache = vaultCache;
}
