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

    // Format the cards to match our UI Card model
    const formattedCards = cards.map(c => ({
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

    return NextResponse.json({ cards: formattedCards, config: null });
  }

  const files = vaultCache.getVaultFiles();
  const cards = cardsFromVault(files);
  const config = getVaultConfig();
  // Omit `files`: same markdown as `cards[].rawContent` — halved payload and JSON parse cost on refresh.
  return NextResponse.json({ cards, config });
}
