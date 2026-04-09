import path from 'path';
import fs from 'fs/promises';

export const STATE_FILE_PATH = path.resolve(process.cwd(), 'demo-vault/.metadachi.json');

export const TEST_STATE = {
  "demo-chocolate-chip-cookies": {
    "favorite": true,
    "pinned": true
  },
  "demo-team-sync": {
    "favorite": true,
    "pinned": false
  },
  "demo-project-ideas": {
    "favorite": false,
    "pinned": true
  }
};

export async function manageOriginalState() {
  let originalState = '{}';
  try {
    originalState = await fs.readFile(STATE_FILE_PATH, 'utf-8');
  } catch {
    originalState = '{}';
  }
  return originalState;
}

export async function resetStateFile() {
  await fs.writeFile(STATE_FILE_PATH, JSON.stringify(TEST_STATE, null, 2));
}

export async function restoreOriginalState(originalState: string) {
  await fs.writeFile(STATE_FILE_PATH, originalState);
}
