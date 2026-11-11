import { getAdminServices } from "@db/admin-queries";
import { ServicesManager } from "@/components/admin/services-manager";

export default async function AdminServicesPage() {
  const services = await getAdminServices();
  return <ServicesManager services={services} />;
}
