import { getServerSupabase } from "./supabase-server";

export type AdminRole = "owner" | "editor";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", user.id)
    .single();

  if (!profile) return null;
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name || profile.email,
    role: profile.role as AdminRole,
  };
}

export async function requireAdmin(
  roles: AdminRole[] = ["owner", "editor"],
): Promise<AdminUser> {
  const admin = await getAdminUser();
  if (!admin || !roles.includes(admin.role)) {
    throw new Error("UNAUTHORIZED");
  }
  return admin;
}
