import fs from 'fs';
import path from 'path';
import { VAULT_PATH } from './vault';

const STATE_FILE = path.join(VAULT_PATH, '.metadachi.json');

export type ItemState = {
  pinned?: boolean;
  favorite?: boolean;
};

export type VaultStates = Record<string, ItemState>;

export function getStates(): VaultStates {
  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }
  try {
    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(content) as VaultStates;
  } catch (e) {
    console.error('Failed to parse .metadachi.json', e);
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
  
  // Ensure the directory exists (though VAULT_PATH usually does)
  if (!fs.existsSync(VAULT_PATH)) {
    fs.mkdirSync(VAULT_PATH, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(states, null, 2));
}
