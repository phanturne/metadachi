import { NextResponse } from 'next/server';
import { setState } from '@/lib/stateDb';
import { vaultCache } from '@/lib/vaultCache';
import { getVaultMode } from '@/lib/vaultMode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, pinned } = body;

    if (!id || typeof pinned !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (getVaultMode() === 'demo') {
      return NextResponse.json({ success: true, fake: true });
    }

    // 1. Update the state JSON file
    setState(id, { pinned });

    // 2. Immediately update the in-memory cache so next GET request reflects the change
    vaultCache.updateState(id, { pinned });

    return NextResponse.json({ success: true, id, pinned });
  } catch (error) {
    console.error('Failed to update pin state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
