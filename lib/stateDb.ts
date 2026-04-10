import fs from 'fs';
import path from 'path';
import { VAULT_PATH } from './vault';

const METADACHI_DIR = path.join(VAULT_PATH, '.metadachi');
const STATE_FILE = path.join(METADACHI_DIR, 'state.json');
const LEGACY_STATE_FILE = path.join(VAULT_PATH, '.metadachi.json');

export type ItemState = {
  pinned?: boolean;
  favorite?: boolean;
};

export type VaultStates = Record<string, ItemState>;

export function getStates(): VaultStates {
  // Migration logic
  if (!fs.existsSync(STATE_FILE) && fs.existsSync(LEGACY_STATE_FILE)) {
    try {
      if (!fs.existsSync(METADACHI_DIR)) {
        fs.mkdirSync(METADACHI_DIR, { recursive: true });
      }
      fs.copyFileSync(LEGACY_STATE_FILE, STATE_FILE);
      console.log('[stateDb] Migrated legacy .metadachi.json to .metadachi/state.json');
      // Optionally rename or delete the old file, but leaving it or deleting it is fine.
      // We will delete it to clean up.
      fs.unlinkSync(LEGACY_STATE_FILE);
    } catch (e) {
      console.error(`[stateDb] Failed to migrate legacy state file: ${(e as Error).message}`);
    }
  }

  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }
  try {
    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    if (!content || content.trim() === '') return {};
    return JSON.parse(content) as VaultStates;
  } catch (e) {
    console.warn(`[stateDb] Failed to parse .metadachi/state.json: ${(e as Error).message}`);
    return {};
  }
}

export function getState(id: string): ItemState {
  const states = getStates();
  return states[id] || {};
}

export function setState(id: string, newState: Partial<ItemState>) {
  const states = getStates();
  states[id] = { ...states[id], ...newState };
  
  // Ensure the directory exists
  if (!fs.existsSync(METADACHI_DIR)) {
    fs.mkdirSync(METADACHI_DIR, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2));
}
