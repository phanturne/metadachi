import { NextResponse } from 'next/server';
import { setDeckState, getDeckState } from '@/lib/stateDb';
import { vaultCache } from '@/lib/vaultCache';
import { getVaultMode } from '@/lib/vaultMode';
import { triggerSync } from '@/lib/syncService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deck = searchParams.get('deck');

  if (!deck) {
    return NextResponse.json({ error: 'deck parameter is required' }, { status: 400 });
  }

  const state = getDeckState(deck);
  return NextResponse.json({ deck, ...state });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deck, published } = body;

    if (!deck || typeof published !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (getVaultMode() === 'demo') {
      return NextResponse.json({ success: true, fake: true });
    }

    setDeckState(deck, { published });
    vaultCache.updateDeckState(deck, { published });
    triggerSync();

    return NextResponse.json({ success: true, deck, published });
  } catch (error) {
    console.error('Failed to update deck published state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}