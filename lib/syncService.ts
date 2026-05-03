import { vaultCache } from './vaultCache';
import { getVaultConfig } from './vault';
import { Card } from './types';
import { supabaseService as supabase } from './supabase/service';

class HubSyncService {
  private isSyncing: boolean = false;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Listen for cache updates
    vaultCache.events.on('update', () => this.handleVaultUpdate());
  }

  private async handleVaultUpdate() {
    const config = getVaultConfig();
    
    const cards = vaultCache.getVaultFiles();
    const publishedCards = cards.filter(f => f.meta.published);

    if (publishedCards.length === 0) return;

    // Check if we have an active session before attempting sync
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('[HubSync] Cards are marked as published, but no active Supabase session found. Please sign in.');
      return;
    }

    if (!config.hubUrl) {
      console.warn('[HubSync] Cards are marked as published, but Hub URL is not configured.');
      return;
    }

    this.scheduleSync(session.user.id);
  }

  private scheduleSync(userId: string) {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.performSync(userId), 2000); // 2 second debounce
  }

  private async performSync(userId: string) {
    if (this.isSyncing) return;
    
    const config = getVaultConfig();
    const publishedCards = vaultCache.getVaultFiles()
      .filter(f => f.meta.published)
      .map(f => ({
        author_id: userId,
        id: f.meta.id, // We use the stable local ID as the DB ID if possible, or mapping
        title: f.meta.title,
        raw_content: f.rawContent,
        type: f.meta.type,
        slug: f.meta.slug || f.meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: f.meta.tags,
        published: true,
        metadata: {
            source: f.meta.source,
            suggested_path: f.meta.suggested_path
        }
      }));

    if (publishedCards.length === 0) return;

    this.isSyncing = true;
    console.log(`[HubSync] Syncing ${publishedCards.length} cards to Supabase...`);

    try {
      // Upsert cards to the 'cards' table
      const { error } = await supabase
        .from('cards')
        .upsert(publishedCards, { onConflict: 'id' });

      if (error) throw error;
      
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
