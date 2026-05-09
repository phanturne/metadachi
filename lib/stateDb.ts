import fs from 'fs';
import path from 'path';
import { VAULT_PATH } from './vault';

const METADACHI_DIR = path.join(VAULT_PATH, '.metadachi');
const STATE_FILE = path.join(METADACHI_DIR, 'state.json');
const LEGACY_STATE_FILE = path.join(VAULT_PATH, '.metadachi.json');

export type ItemState = {
  pinned?: boolean;
  favorite?: boolean;
  published?: boolean;
};

export type DeckState = {
  published?: boolean;
};

export type VaultStates = Record<string, ItemState>;
export type DeckStates = Record<string, DeckState>;

interface StateFile {
  items?: VaultStates;
  decks?: DeckStates;
}

export function getStates(): VaultStates {
  // Migration logic
  if (!fs.existsSync(STATE_FILE) && fs.existsSync(LEGACY_STATE_FILE)) {
    try {
      if (!fs.existsSync(METADACHI_DIR)) {
        fs.mkdirSync(METADACHI_DIR, { recursive: true });
      }
      fs.copyFileSync(LEGACY_STATE_FILE, STATE_FILE);
      console.log('[stateDb] Migrated legacy .metadachi.json to .metadachi/state.json');
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
    const state = JSON.parse(content) as StateFile;
    // Support both old format (flat) and new format (nested)
    if (state.items) return state.items;
    // Legacy migration: if the file is just a flat object of item states, return it
    return state as VaultStates;
  } catch (e) {
    console.warn(`[stateDb] Failed to parse .metadachi/state.json: ${(e as Error).message}`);
    return {};
  }
}

export function getDeckStates(): DeckStates {
  if (!fs.existsSync(STATE_FILE)) {
    return {};
  }
  try {
    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    if (!content || content.trim() === '') return {};
    const state = JSON.parse(content) as StateFile;
    return state.decks || {};
  } catch (e) {
    console.warn(`[stateDb] Failed to parse .metadachi/state.json: ${(e as Error).message}`);
    return {};
  }
}

export function getState(id: string): ItemState {
  const states = getStates();
  return states[id] || {};
}

export function getDeckState(deck: string): DeckState {
  const states = getDeckStates();
  return states[deck] || {};
}

function saveState(state: StateFile) {
  if (!fs.existsSync(METADACHI_DIR)) {
    fs.mkdirSync(METADACHI_DIR, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function setState(id: string, newState: Partial<ItemState>) {
  const items = getStates();
  items[id] = { ...items[id], ...newState };
  saveState({ items, decks: getDeckStates() });
}

export function setDeckState(deck: string, newState: Partial<DeckState>) {
  const decks = getDeckStates();
  decks[deck] = { ...decks[deck], ...newState };
  saveState({ items: getStates(), decks });
}
