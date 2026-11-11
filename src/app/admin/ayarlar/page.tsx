import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getSettings } from "@db/queries";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await getAdminUser();
  if (!admin || admin.role !== "owner") redirect("/admin");
  const settings = await getSettings();
  return <SettingsForm settings={settings} />;
}
