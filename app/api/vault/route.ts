import { NextResponse } from 'next/server';
import { cardsFromVault, getVaultConfig } from '@/lib/vault';
import { vaultCache } from '@/lib/vaultCache';
import { getVaultMode } from '@/lib/vaultMode';
import { createClient } from '@/lib/supabase/server';
import '@/lib/syncService'; // Initialize sync service on server

export const dynamic = 'force-dynamic';

export async function GET() {
  const mode = getVaultMode();

  if (mode === 'hub') {
    const supabase = await createClient();
    // Fetch all published cards for the global community feed
    const { data: cards, error } = await supabase
      .from('cards')
      .select('*, profiles(handle, display_name)')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Separate flashcards from regular cards
    const regularCards: typeof cards = [];
    const flashcardDecks: Record<string, { deck: string; count: number; cardIds: string[] }> = {};

    for (const card of cards) {
      if (card.type === 'flashcard') {
        // Extract deck from metadata or slug
        const deck = card.deck || 'default';
        if (!flashcardDecks[deck]) {
          flashcardDecks[deck] = { deck, count: 0, cardIds: [] };
        }
        flashcardDecks[deck].count++;
        flashcardDecks[deck].cardIds.push(card.id);
      } else {
        regularCards.push(card);
      }
    }

    // Format the regular cards to match our UI Card model
    const formattedCards = regularCards.map(c => ({
      id: c.id,
      title: c.title,
      rawContent: c.raw_content,
      type: c.type,
      tags: c.tags,
      created: c.created_at,
      author: c.profiles?.handle,
      slug: c.slug,
      published: true,
      pinned: false,
      favorite: false,
      filePath: `community/${c.profiles?.handle}/${c.slug}`,
      relativePath: `${c.profiles?.handle}/${c.slug}`
    }));

    // Format flashcard decks
    const flashcardCollections = Object.values(flashcardDecks).map(d => ({
      deck: d.deck,
      count: d.count,
      // Store first card ID for preview, but exclude from main list
      previewId: d.cardIds[0],
      cardIds: d.cardIds
    }));

    return NextResponse.json({
      cards: formattedCards,
      config: null,
      flashcardCollections
    });
  }

  const files = vaultCache.getVaultFiles();
  const cards = cardsFromVault(files);
  const config = getVaultConfig();
  // Omit `files`: same markdown as `cards[].rawContent` — halved payload and JSON parse cost on refresh.
  return NextResponse.json({ cards, config });
}
