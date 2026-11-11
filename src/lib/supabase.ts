import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY Vercel Environment Variables'a eklenmeli.",
      );
    }
    cached = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return cached;
}

export async function adminRpc<T>(
  fn: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await getSupabase().rpc(fn, {
    p_secret: process.env.ADMIN_API_SECRET!,
    ...params,
  });
  if (error) throw new Error(error.message);
  return data as T;
}
