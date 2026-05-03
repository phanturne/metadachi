import { vaultCache } from './vaultCache';
import { getVaultConfig } from './vault';
import { Card } from './types';

class HubSyncService {
  private isSyncing: boolean = false;
  private syncQueue: Set<string> = new Set();
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Listen for cache updates
    vaultCache.events.on('update', () => this.handleVaultUpdate());
  }

  private handleVaultUpdate() {
    const config = getVaultConfig();
    if (!config.authorHandle || !config.hubUrl) {
      // Missing sync config, skip
      return;
    }

    const cards = vaultCache.getVaultFiles();
    const publishedCards = cards.filter(f => f.meta.published);

    if (publishedCards.length === 0) return;

    // In a real implementation, we would compare hashes to see what actually changed.
    // For now, we'll trigger a debounced sync check.
    this.scheduleSync();
  }

  private scheduleSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.performSync(), 2000); // 2 second debounce
  }

  private async performSync() {
    if (this.isSyncing) return;
    
    const config = getVaultConfig();
    const publishedCards = vaultCache.getVaultFiles()
      .filter(f => f.meta.published)
      .map(f => ({
        ...f.meta,
        rawContent: f.rawContent,
        author: config.authorHandle
      }));

    if (publishedCards.length === 0) return;

    this.isSyncing = true;
    console.log(`[HubSync] Syncing ${publishedCards.length} cards to ${config.hubUrl}...`);

    try {
      // In a real scenario, this would be a POST to your Hub API
      // await fetch(`${config.hubUrl}/api/hub/sync`, {
      //   method: 'POST',
      //   body: JSON.stringify({ author: config.authorHandle, cards: publishedCards })
      // });
      
      console.log('[HubSync] Sync successful');
    } catch (error) {
      console.error('[HubSync] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

// Singleton instance
export const hubSyncService = new HubSyncService();
