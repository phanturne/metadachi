import { vaultCache } from './vaultCache';
import { getVaultConfig } from './vault';
import { supabaseService as supabase } from './supabase/service';

interface SyncedCard {
  id: string;
  lastSyncedAt: string;
  pending?: boolean;
}

class HubSyncService {
  private isSyncing: boolean = false;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private syncedCards: Map<string, SyncedCard> = new Map();
  private initialized: boolean = false;

  constructor() {
    vaultCache.events.on('update', () => this.handleVaultUpdate());
  }

  private initializeSyncState() {
    if (this.initialized) return;
    this.initialized = true;

    // On startup, mark all currently published cards as already synced
    // so we don't re-upload them on server restart
    const cards = vaultCache.getVaultFiles();
    const deckNames = new Set(cards.map((card) => this.extractDeckFromPath(card.path)));

    const publishedDecks = new Set<string>();
    for (const deck of deckNames) {
      if (vaultCache.isDeckPublished(deck)) {
        publishedDecks.add(deck);
      }
    }

    const now = new Date().toISOString();
    for (const card of cards) {
      const deck = this.extractDeckFromPath(card.path);
      const isPublished = publishedDecks.has(deck) || card.meta.published === true;
      if (isPublished) {
        // Card is currently published - assume it was already synced before restart
        this.syncedCards.set(card.meta.id, { id: card.meta.id, lastSyncedAt: now });
      }
    }

    console.log(`[HubSync] Initialized with ${this.syncedCards.size} already-synced cards`);
  }

  public async handleVaultUpdate() {
    this.initializeSyncState();
    const config = getVaultConfig();

    const cards = vaultCache.getVaultFiles();
    const deckNames = new Set(cards.map((card) => this.extractDeckFromPath(card.path)));

    const publishedDecks = new Set<string>();
    for (const deck of deckNames) {
      if (vaultCache.isDeckPublished(deck)) {
        publishedDecks.add(deck);
      }
    }

    // Check which cards need to be synced
    const now = new Date().toISOString();
    const cardsToSync = cards.filter((card) => {
      const deck = this.extractDeckFromPath(card.path);
      const shouldBePublished = publishedDecks.has(deck) || card.meta.published === true;

      if (!shouldBePublished) {
        // Card is unpublished - clear from synced cache if it was there
        if (this.syncedCards.has(card.meta.id)) {
          this.syncedCards.delete(card.meta.id);
        }
        return false;
      }

      // Check if this card was already successfully synced (or pending)
      const synced = this.syncedCards.get(card.meta.id);
      if (synced?.pending) return false; // Already scheduled for sync
      if (synced) {
        // Already successfully synced - check if content changed
        // Flashcard content updates don't trigger resync
        if (card.meta.type === 'flashcard') return false;

        const lastSync = new Date(synced.lastSyncedAt).getTime();
        const fileModTime = vaultCache.getFileModTime(card.path);
        if (fileModTime && fileModTime > lastSync) return true;
        return false;
      }
      return true; // Never synced - sync it
    });

    if (cardsToSync.length === 0) return;

    // Mark cards as pending BEFORE scheduling to prevent duplicate syncs
    for (const card of cardsToSync) {
      this.syncedCards.set(card.meta.id, { id: card.meta.id, lastSyncedAt: now, pending: true });
    }

    // Check session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('[HubSync] Cards are marked as published, but no active Supabase session found.');
      return;
    }

    if (!config.hubUrl) {
      console.warn('[HubSync] Cards are marked as published, but Hub URL is not configured.');
      return;
    }

    this.scheduleSync(session.user.id, cardsToSync, now);
  }

  private scheduleSync(userId: string, cardsToSync: any[], syncTimestamp: string) {
    // Don't schedule if already syncing
    if (this.isSyncing) return;
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.performSync(userId, cardsToSync, syncTimestamp), 2000);
  }

  private async performSync(userId: string, cardsToSync: any[], syncTimestamp: string) {
    if (this.isSyncing) return;

    this.isSyncing = true;
    console.log(`[HubSync] Syncing ${cardsToSync.length} updated cards to Supabase...`);

    const payload = cardsToSync.map(f => ({
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

    const BATCH_SIZE = 200;
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        const batch = payload.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.rpc('upsert_published_cards', {
          p_cards: batch,
        });

        if (error) {
          console.error(`[HubSync] Batch ${Math.floor(i / BATCH_SIZE) + 1} failed, retrying individually:`, error.message);
          failCount += batch.length;
          // Retry individually - upsert will handle conflicts
          for (const card of batch) {
            const { error: individualError } = await supabase.rpc('upsert_published_cards', {
              p_cards: [card],
            });
            if (individualError) {
              console.error(`[HubSync] Failed to sync card ${card.id}:`, individualError.message);
            } else {
              successCount++;
              this.syncedCards.set(card.id, { id: card.id, lastSyncedAt: syncTimestamp, pending: false });
            }
          }
        } else {
          successCount += batch.length;
          // Mark these cards as synced (clear pending flag)
          for (const card of batch) {
            this.syncedCards.set(card.id, { id: card.id, lastSyncedAt: syncTimestamp, pending: false });
          }
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
    // Extract deck from path - consistent with useFlashcards.ts
    const parts = filePath.split('/');
    // If under Flashcards/, use the subfolder (parts[1]) as deck
    if (parts[0] === 'Flashcards' && parts.length >= 3) {
      return parts[1];
    }
    // For non-flashcard files, use parent folder
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    return 'default';
  }
}

// Singleton instance
export const hubSyncService = new HubSyncService();

// Explicit sync trigger for API routes
export function triggerSync() {
  hubSyncService.handleVaultUpdate();
}
