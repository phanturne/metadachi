import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await request.json();
    if (!session) {
      return NextResponse.json({ error: 'No session provided' }, { status: 400 });
    }

    const VAULT_PATH = process.env.VAULT_PATH || './demo-vault';
    const SESSION_FILE = path.resolve(process.cwd(), VAULT_PATH, '.metadachi', 'session.json');
    
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // This key must match the one used by the Supabase client internally
    // Usually 'sb-' + project_ref + '-auth-token' or just a generic key if using custom storage
    // Since we used customStorage in service.ts, we can use a stable key.
    const storageData = {
      'metadachi-auth-session': JSON.stringify(session)
    };

    fs.writeFileSync(SESSION_FILE, JSON.stringify(storageData, null, 2));
    console.log('[AuthBridge] Session synced to local file system');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AuthBridge] Failed to sync session:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
