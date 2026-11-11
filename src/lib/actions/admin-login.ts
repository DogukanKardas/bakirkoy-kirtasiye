"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase-admin";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

async function ensureBootstrapUser(email: string, password: string) {
  const admin = getServiceSupabase();
  const normalized = email.toLowerCase();

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error(listError.message);

  let user = listed.users.find((u) => u.email?.toLowerCase() === normalized);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: normalized,
      password,
      email_confirm: true,
      user_metadata: { name: "Admin" },
    });
    if (error || !data.user) {
      throw new Error(error?.message || "Admin kullanıcısı oluşturulamadı");
    }
    user = data.user;
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: normalized,
      name: "Admin",
      role: "owner",
    },
    { onConflict: "id" },
  );
  if (profileError) throw new Error(profileError.message);
}

export async function adminPasswordLoginAction(input: {
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  if (!email || !password) {
    return { ok: false, error: "E-posta ve şifre gerekli" };
  }

  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  const bootstrapPassword = process.env.ADMIN_PASSWORD || "";
  const isBootstrap =
    Boolean(bootstrapEmail) &&
    Boolean(bootstrapPassword) &&
    safeEqual(email, bootstrapEmail) &&
    safeEqual(password, bootstrapPassword);

  if (isBootstrap) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return {
        ok: false,
        error:
          "ADMIN_EMAIL/PASSWORD tanımlı ama SUPABASE_SERVICE_ROLE_KEY eksik",
      };
    }
    try {
      await ensureBootstrapUser(email, password);
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Bootstrap başarısız",
      };
    }
  }

  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    return { ok: false, error: "Supabase public env eksik" };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
