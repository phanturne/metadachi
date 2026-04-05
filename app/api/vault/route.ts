import { NextResponse } from 'next/server';
import { cardsFromVault } from '@/lib/vault';
import { vaultCache } from '@/lib/vaultCache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const files = vaultCache.getVaultFiles();
  const cards = cardsFromVault(files);
  return NextResponse.json({ files, cards });
}
