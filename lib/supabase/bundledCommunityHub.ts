/**
 * Optional baked-in defaults for the shared Metadachi community hub.
 *
 * The Supabase anon (publishable) key is designed to ship in apps; Row Level Security
 * enforces who can read/write rows. Embed your production hub credentials here so people
 * can run Metadachi without setting NEXT_PUBLIC_SUPABASE_*.
 *
 * Self-hosters pointing at another project should use .env overrides instead (they win).
 */

export const BUNDLED_COMMUNITY_SUPABASE_URL = 'https://hzifjapwyomiqwfkprec.supabase.co';

export const BUNDLED_COMMUNITY_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SYRBI7qDOQRvbisk0BKQTg_Uu9QYcda';
