import { NextResponse } from 'next/server';
import { setState } from '@/lib/stateDb';
import { vaultCache } from '@/lib/vaultCache';
import { getVaultMode } from '@/lib/vaultMode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, published } = body;

    if (!id || typeof published !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (getVaultMode() === 'demo') {
      return NextResponse.json({ success: true, fake: true });
    }

    // 1. Update the state JSON file
    setState(id, { published });

    // 2. Immediately update the in-memory cache
    vaultCache.updateState(id, { published });

    return NextResponse.json({ success: true, id, published });
  } catch (error) {
    console.error('Failed to update published state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
