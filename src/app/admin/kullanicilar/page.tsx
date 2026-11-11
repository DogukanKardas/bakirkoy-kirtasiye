import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getAdminProfiles } from "@db/admin-queries";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await getAdminUser();
  if (!admin || admin.role !== "owner") redirect("/admin");
  const profiles = await getAdminProfiles();
  return <UsersManager profiles={profiles} currentUserId={admin.id} />;
}
