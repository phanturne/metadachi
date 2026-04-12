import { VAULT_PATH } from '@/lib/vault';
import { resolveSafeVaultMarkdownPath } from '@/lib/vaultPaths';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

function assertWritable() {
  if (isDemoMode) {
    return NextResponse.json(
      { error: 'File writes are disabled in demo mode. Use the in-browser vault editor.' },
      { status: 403 }
    );
  }
  if (!VAULT_PATH) {
    return NextResponse.json({ error: 'VAULT_PATH is not configured' }, { status: 500 });
  }
  return null;
}

export async function PUT(request: Request) {
  const denied = assertWritable();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { relativePath, raw } = body as { relativePath?: string; raw?: string };
    if (!relativePath || typeof raw !== 'string') {
      return NextResponse.json({ error: 'relativePath and raw are required' }, { status: 400 });
    }

    const abs = resolveSafeVaultMarkdownPath(VAULT_PATH, relativePath);
    if (!abs) {
      return NextResponse.json({ error: 'Invalid relativePath' }, { status: 400 });
    }

    const dir = path.dirname(abs);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(abs, raw, 'utf-8');

    return NextResponse.json({ success: true, relativePath });
  } catch (e) {
    console.error('[vault/file] PUT failed:', e);
    return NextResponse.json({ error: 'Failed to write file' }, { status: 500 });
  }
}

/** Rename or move a markdown file within the vault (same as `mv`). */
export async function PATCH(request: Request) {
  const denied = assertWritable();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { fromRelativePath, toRelativePath } = body as {
      fromRelativePath?: string;
      toRelativePath?: string;
    };
    if (!fromRelativePath || !toRelativePath) {
      return NextResponse.json({ error: 'fromRelativePath and toRelativePath are required' }, { status: 400 });
    }
    if (fromRelativePath === toRelativePath) {
      return NextResponse.json({ success: true, relativePath: toRelativePath });
    }

    const fromAbs = resolveSafeVaultMarkdownPath(VAULT_PATH, fromRelativePath);
    const toAbs = resolveSafeVaultMarkdownPath(VAULT_PATH, toRelativePath);
    if (!fromAbs || !toAbs) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    if (!fs.existsSync(fromAbs)) {
      return NextResponse.json({ error: 'Source file not found' }, { status: 404 });
    }
    if (fs.existsSync(toAbs)) {
      return NextResponse.json({ error: 'Destination already exists' }, { status: 409 });
    }

    fs.mkdirSync(path.dirname(toAbs), { recursive: true });

    try {
      fs.renameSync(fromAbs, toAbs);
    } catch (e: unknown) {
      const err = e as NodeJS.ErrnoException;
      if (err?.code === 'EXDEV') {
        fs.copyFileSync(fromAbs, toAbs);
        fs.unlinkSync(fromAbs);
      } else {
        throw e;
      }
    }

    return NextResponse.json({ success: true, relativePath: toRelativePath });
  } catch (e) {
    console.error('[vault/file] PATCH failed:', e);
    return NextResponse.json({ error: 'Failed to rename file' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = assertWritable();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get('relativePath');
    if (!relativePath) {
      return NextResponse.json({ error: 'relativePath query is required' }, { status: 400 });
    }

    const abs = resolveSafeVaultMarkdownPath(VAULT_PATH, relativePath);
    if (!abs) {
      return NextResponse.json({ error: 'Invalid relativePath' }, { status: 400 });
    }

    if (!fs.existsSync(abs)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    fs.unlinkSync(abs);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[vault/file] DELETE failed:', e);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

/** Create a new markdown file under the vault (normal mode only). */
export async function POST() {
  const denied = assertWritable();
  if (denied) return denied;

  try {
    const rel = `note-${randomUUID()}.md`;
    const raw = `---\ntitle: New note\ntype: note\n---\n\n# New note\n`;
    const abs = resolveSafeVaultMarkdownPath(VAULT_PATH, rel);
    if (!abs) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    if (fs.existsSync(abs)) {
      return NextResponse.json({ error: 'File already exists' }, { status: 409 });
    }
    fs.writeFileSync(abs, raw, 'utf-8');
    return NextResponse.json({ success: true, relativePath: rel });
  } catch (e) {
    console.error('[vault/file] POST failed:', e);
    return NextResponse.json({ error: 'Failed to create file' }, { status: 500 });
  }
}
