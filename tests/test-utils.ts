import path from 'path';
import fs from 'fs/promises';

const DEMO_VAULT_ROOT = path.resolve(process.cwd(), 'demo-vault');
export const STATE_FILE_PATH = path.join(DEMO_VAULT_ROOT, '.metadachi/state.json');
export const CONFIG_FILE_PATH = path.join(DEMO_VAULT_ROOT, '.metadachi/config.json');

export const TEST_STATE = {
  'demo-chocolate-chip-cookies': {
    favorite: true,
    pinned: true,
  },
  'demo-team-sync': {
    favorite: false,
    pinned: false,
  },
  'demo-project-ideas': {
    favorite: false,
    pinned: true,
  },
};

export async function manageOriginalState(): Promise<string> {
  try {
    return await fs.readFile(STATE_FILE_PATH, 'utf-8');
  } catch {
    return '{}';
  }
}

export async function resetStateFile(): Promise<void> {
  const legacy = path.join(DEMO_VAULT_ROOT, '.metadachi.json');
  await fs.unlink(legacy).catch(() => {});
  const dir = path.dirname(STATE_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(STATE_FILE_PATH, JSON.stringify(TEST_STATE, null, 2), 'utf-8');
}

export async function restoreOriginalState(originalState: string): Promise<void> {
  const dir = path.dirname(STATE_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(STATE_FILE_PATH, originalState, 'utf-8');
}

export async function manageOriginalConfig(): Promise<string> {
  try {
    return await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
  } catch {
    return '';
  }
}

export async function restoreConfigJson(content: string): Promise<void> {
  if (!content) return;
  const dir = path.dirname(CONFIG_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CONFIG_FILE_PATH, content, 'utf-8');
}

export async function resetConfigToFixture(): Promise<void> {
  const fixture = path.join(process.cwd(), 'tests/fixtures/demo-metadachi/config.json');
  const dir = path.dirname(CONFIG_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.copyFile(fixture, CONFIG_FILE_PATH);
}
