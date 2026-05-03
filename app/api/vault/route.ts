import { NextResponse } from 'next/server';
import { cardsFromVault, getVaultConfig } from '@/lib/vault';
import { vaultCache } from '@/lib/vaultCache';
import { getVaultMode } from '@/lib/vaultMode';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mode = getVaultMode();
  
  if (mode === 'hub') {
    // In a real implementation, this would fetch from Supabase
    // based on the current user context or a global feed.
    return NextResponse.json({ cards: [], config: null });
  }

  const files = vaultCache.getVaultFiles();
  const cards = cardsFromVault(files);
  const config = getVaultConfig();
  // Omit `files`: same markdown as `cards[].rawContent` — halved payload and JSON parse cost on refresh.
  return NextResponse.json({ cards, config });
}
