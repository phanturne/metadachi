import { NextResponse } from 'next/server';
import { cardsFromVault, getVaultConfig } from '@/lib/vault';
import { vaultCache } from '@/lib/vaultCache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const files = vaultCache.getVaultFiles();
  const cards = cardsFromVault(files);
  const config = getVaultConfig();
  // Omit `files`: same markdown as `cards[].rawContent` — halved payload and JSON parse cost on refresh.
  return NextResponse.json({ cards, config });
}
