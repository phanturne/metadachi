import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * SERVICE CLIENT
 * This client is for background server tasks (like HubSyncService).
 * It uses file-based session persistence to keep the user logged in across restarts.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Persistence logic
const VAULT_PATH = process.env.VAULT_PATH || './demo-vault';
const SESSION_FILE = path.resolve(process.cwd(), VAULT_PATH, '.metadachi', 'session.json');

const fileStorage = {
  getItem: (key: string) => {
    if (!fs.existsSync(SESSION_FILE)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      return data[key] || null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    const dir = path.dirname(SESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    let data = {};
    if (fs.existsSync(SESSION_FILE)) {
      try {
        data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      } catch {}
    }
    (data as any)[key] = value;
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  },
  removeItem: (key: string) => {
    if (!fs.existsSync(SESSION_FILE)) return;
    try {
      const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
      delete data[key];
      fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
    } catch {}
  }
};

export const supabaseService = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: fileStorage,
    storageKey: 'metadachi-auth-session',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
