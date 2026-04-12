import type { DemoOverlayV1 } from './types';

const DB_NAME = 'metadachi-demo';
const STORE = 'kv';
const KEY = 'overlay-v1';

/** Single open connection; reopen after versionchange / close. */
let dbPromise: Promise<IDBDatabase> | null = null;

export function createEmptyDemoOverlay(): DemoOverlayV1 {
  return {
    schemaVersion: 1,
    pinFavoriteById: {},
    contentByCardId: {},
    virtualFiles: [],
    tombstonedIds: [],
    renamedByCardId: {},
  };
}

function getDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB requires window'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        db.onclose = () => {
          dbPromise = null;
        };
        resolve(db);
      };
      req.onerror = () => {
        dbPromise = null;
        reject(req.error);
      };
    });
  }
  return dbPromise;
}

export async function loadDemoOverlay(): Promise<DemoOverlayV1> {
  if (typeof window === 'undefined') {
    return createEmptyDemoOverlay();
  }
  try {
    const db = await getDatabase();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const getReq = tx.objectStore(STORE).get(KEY);
      getReq.onsuccess = () => {
        const v = getReq.result as DemoOverlayV1 | undefined;
        if (!v || v.schemaVersion !== 1) {
          resolve(createEmptyDemoOverlay());
          return;
        }
        resolve({
          ...createEmptyDemoOverlay(),
          ...v,
          pinFavoriteById: v.pinFavoriteById ?? {},
          contentByCardId: v.contentByCardId ?? {},
          virtualFiles: v.virtualFiles ?? [],
          tombstonedIds: v.tombstonedIds ?? [],
          renamedByCardId: v.renamedByCardId ?? {},
        });
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    return createEmptyDemoOverlay();
  }
}

export async function saveDemoOverlay(overlay: DemoOverlayV1): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = await getDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(overlay, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearDemoOverlay(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const db = await getDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}
