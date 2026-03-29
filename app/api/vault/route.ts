import { NextResponse } from 'next/server';
import { readVault, cardsFromVault } from '@/lib/vault';

export const dynamic = 'force-dynamic';

export async function GET() {
  const files = readVault();
  const cards = cardsFromVault(files);
  return NextResponse.json({ files, cards });
}
