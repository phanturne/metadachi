import chokidar, { FSWatcher } from 'chokidar';
import { parseFile, readVault, VAULT_PATH } from './vault';
import { VaultFile } from './types';
import { getStates } from './stateDb';

// Prevent multiple instances in development
const globalForVaultCache = globalThis as unknown as {
  vaultCache: VaultCacheSingleton | undefined;
};

class VaultCacheSingleton {
  public files: Map<string, VaultFile> = new Map();
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
           // If we add 'favorite' logic later we apply it here
        }
        this.files.set(f.path, f);
      }
      this.syncDone = true;
      this.isReady = true;
      console.log(`[VaultCache] Loaded ${this.files.size} files in memory.`);
    }

    this.watcher = chokidar.watch(VAULT_PATH, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles exactly like .metadachi.json
      persistent: true,
      ignoreInitial: true // Initial reads were done synchronously
    });

    this.watcher
      .on('add', (filePath: string) => this.handleFileEvent(filePath))
      .on('change', (filePath: string) => this.handleFileEvent(filePath))
      .on('unlink', (filePath: string) => this.handleFileRemove(filePath));
  }

  private handleFileEvent(filePath: string) {
    if (!filePath.endsWith('.md')) return;
    const parsed = parseFile(filePath);
    if (parsed) {
      const states = getStates();
      const state = states[parsed.meta.id];
      if (state && state.pinned !== undefined) {
         parsed.meta.pinned = state.pinned;
      }
      this.files.set(filePath, parsed);
    }
  }

  private handleFileRemove(filePath: string) {
    this.files.delete(filePath);
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
