import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { VAULT_PATH, getVaultConfig } from '@/lib/vault';
import type { VaultConfig } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getVaultConfig());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentConfig = getVaultConfig();
    const newConfig: VaultConfig = {
      types: body.types ?? currentConfig.types,
      filterBarOrder: body.filterBarOrder ?? currentConfig.filterBarOrder,
    };

    const METADACHI_DIR = path.join(VAULT_PATH, '.metadachi');
    const CONFIG_FILE = path.join(METADACHI_DIR, 'config.json');

    if (!fs.existsSync(METADACHI_DIR)) {
      fs.mkdirSync(METADACHI_DIR, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));

    return NextResponse.json({ success: true, config: newConfig });
  } catch (err) {
    console.error('[API Config] Error updating config:', err);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
