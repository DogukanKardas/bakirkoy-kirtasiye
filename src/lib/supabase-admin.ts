import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/env";

let cached: SupabaseClient | null = null;

/** Service role — yalnızca sunucu; RLS’i bypass eder. */
export function getServiceSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY eksik. Vercel Environment Variables’a ekleyin.",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
