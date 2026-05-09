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

    // Get all decks and check which are published
    const cards = vaultCache.getVaultFiles();

    // Collect all deck names from cards
    const deckNames = new Set<string>();
    for (const card of cards) {
      const deck = this.extractDeckFromPath(card.path);
      deckNames.add(deck);
    }

    // Get published decks
    const publishedDeckNames = new Set<string>();
    for (const deck of deckNames) {
      if (vaultCache.isDeckPublished(deck)) {
        publishedDeckNames.add(deck);
      }
    }

    // If no decks are published, nothing to sync
    if (publishedDeckNames.size === 0) return;

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

    this.scheduleSync(session.user.id, publishedDeckNames);
  }

  private scheduleSync(userId: string, publishedDecks: Set<string>) {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.performSync(userId, publishedDecks), 2000); // 2 second debounce
  }

  private async performSync(userId: string, publishedDecks: Set<string>) {
    if (this.isSyncing) return;

    // Get all files and filter by published decks
    const allFiles = vaultCache.getVaultFiles();

    // Get deck from folder path (e.g., "Leetcode/LC-1.md" -> "Leetcode")
    const cardsToSync = allFiles
      .filter(f => {
        const deck = this.extractDeckFromPath(f.path);
        return publishedDecks.has(deck);
      })
      .map(f => ({
        author_id: userId,
        id: f.meta.id,
        title: f.meta.title,
        raw_content: f.rawContent,
        type: f.meta.type,
        slug: f.meta.slug || f.meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: f.meta.tags,
        deck: this.extractDeckFromPath(f.path),
        published: true,
        metadata: {
          source: f.meta.source,
          suggested_path: f.meta.suggested_path
        }
      }));

    if (cardsToSync.length === 0) return;

    this.isSyncing = true;
    console.log(`[HubSync] Syncing ${cardsToSync.length} cards to Supabase for decks: ${[...publishedDecks].join(', ')}...`);

    const BATCH_SIZE = 200;
    let successCount = 0;
    let failCount = 0;

    try {
      // Process in batches of 200
      for (let i = 0; i < cardsToSync.length; i += BATCH_SIZE) {
        const batch = cardsToSync.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.rpc('upsert_published_cards', {
          p_cards: batch,
        });

        if (error) {
          console.error(`[HubSync] Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
          failCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }

      console.log(`[HubSync] Sync complete: ${successCount} succeeded, ${failCount} failed`);
    } catch (error) {
      console.error('[HubSync] Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private extractDeckFromPath(filePath: string): string {
    // Extract parent folder from relative path (e.g., "Leetcode/LC-1.md" -> "Leetcode")
    const parts = filePath.split('/');
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    return 'default';
  }
}

// Singleton instance
export const hubSyncService = new HubSyncService();
