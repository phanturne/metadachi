"use client";

import { getEnv } from "@/lib/env";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
