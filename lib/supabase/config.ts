import {
  BUNDLED_COMMUNITY_SUPABASE_PUBLISHABLE_KEY,
  BUNDLED_COMMUNITY_SUPABASE_URL,
} from './bundledCommunityHub';

function envOrUndefined(key: string | undefined): string | undefined {
  const t = key?.trim();
  return t ? t : undefined;
}

/** Env wins when set so forks and isolated hubs stay one-line to configure. */
export function resolveSupabaseUrl(): string {
  return (
    envOrUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    BUNDLED_COMMUNITY_SUPABASE_URL.trim() ??
    ''
  );
}

export function resolveSupabasePublishableKey(): string {
  return (
    envOrUndefined(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    BUNDLED_COMMUNITY_SUPABASE_PUBLISHABLE_KEY.trim() ??
    ''
  );
}
