import chokidar, { FSWatcher } from 'chokidar';
import { parseFile, readVault, VAULT_PATH } from './vault';
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
        // Ignore dotfiles/dotdirectories EXCEPT .metadachi.json
        const basename = filePath.split(/[\\/]/).pop();
        if (!basename) return false;
        return basename.startsWith('.') && basename !== '.metadachi.json';
      },
      persistent: true,
      ignoreInitial: true // Initial reads were done synchronously
    });

    this.watcher
      .on('add', (filePath: string) => this.handleFileEvent(filePath))
      .on('change', (filePath: string) => this.handleFileEvent(filePath))
      .on('unlink', (filePath: string) => this.handleFileRemove(filePath));
  }

  private handleFileEvent(filePath: string) {
    if (filePath.endsWith('.metadachi.json')) {
      console.log('[VaultCache] .metadachi.json updated, applying states...');
      const states = getStates();
      for (const [path, file] of this.files.entries()) {
        const state = states[file.meta.id] || {};
        // If state changed manually, we must update the cache object
        // Notice we apply both truthy and falsy values here since it could be toggled off manually
        file.meta.pinned = state.pinned ?? false;
        file.meta.favorite = state.favorite ?? false;
        this.files.set(path, file);
      }
      this.events.emit('update');
      return;
    }

    if (!filePath.endsWith('.md')) return;
    const parsed = parseFile(filePath);
    if (parsed) {
      const states = getStates();
      const state = states[parsed.meta.id];
      if (state && state.pinned !== undefined) {
         parsed.meta.pinned = state.pinned;
      }
      if (state && state.favorite !== undefined) {
         parsed.meta.favorite = state.favorite;
      }
      this.files.set(filePath, parsed);
      this.events.emit('update');
    }
  }

  private handleFileRemove(filePath: string) {
    if (this.files.has(filePath)) {
      this.files.delete(filePath);
      this.events.emit('update');
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
