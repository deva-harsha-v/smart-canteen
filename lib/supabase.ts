import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev instead of silently shipping a broken client.
  console.error(
    "Missing Supabase environment variables. Check your .env.local file."
  );
}

// In dev, Next.js Fast Refresh re-executes this module on every edit.
// Without caching the client on globalThis, each refresh creates a brand
// new GoTrueClient that fights the previous one over the same browser
// session lock, producing "AbortError: Lock broken by another request
// with the 'steal' option." Caching it keeps a single instance alive
// across hot reloads (harmless no-op in production, where the module
// only ever loads once anyway).
declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

export const supabase =
  globalThis.__supabase__ ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__supabase__ = supabase;
}
