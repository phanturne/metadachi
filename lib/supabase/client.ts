import { createBrowserClient } from '@supabase/ssr';
import { resolveSupabasePublishableKey, resolveSupabaseUrl } from './config';

export function createClient() {
  return createBrowserClient(resolveSupabaseUrl(), resolveSupabasePublishableKey());
}
