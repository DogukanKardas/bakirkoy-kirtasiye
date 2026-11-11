import { getServerSupabase } from "@/lib/supabase-server";
import {
  mapHomeSection,
  mapListRequest,
  mapOrder,
  mapProduct,
  mapService,
  type AuditLog,
  type Collection,
  type ContactMessage,
  type HomeSection,
  type ListRequest,
  type Order,
  type OrderItem,
  type Product,
  type Profile,
  type Service,
} from "./queries";

/* Admin sorguları: oturum açmış personel (is_staff) RLS politikalarıyla çalışır. */

export type AdminProduct = Product & {
  categoryName: string;
  categorySlug: string;
  brandName: string | null;
  updatedAt: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug), brands(name)")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    ...mapProduct(r),
    categoryName: r.categories?.name ?? "",
    categorySlug: r.categories?.slug ?? "",
    brandName: r.brands?.name ?? null,
    updatedAt: r.updated_at ?? r.created_at ?? "",
  }));
}

export async function getAdminListRequests(): Promise<ListRequest[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("list_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapListRequest);
}

export async function getAdminCollections(): Promise<Collection[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("collections")
    .select("*, collection_products(product_id, position)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description ?? "",
    imageUrl: r.image_url ?? "",
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    productIds: (r.collection_products ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((cp: any) => cp.product_id as string),
    isSchoolList: r.is_school_list ?? false,
  }));
}

export async function getAdminHomeSections(): Promise<HomeSection[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("home_sections")
    .select("*")
    .order("position");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapHomeSection);
}

export async function getAdminProfiles(): Promise<Profile[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .order("email");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    email: r.email,
    name: r.name ?? "",
    role: r.role as "owner" | "editor",
  }));
}

export async function getAdminAuditLogs(limit = 12): Promise<AuditLog[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, actor_email, action, entity, entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    actorEmail: r.actor_email,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    createdAt: r.created_at,
  }));
}

export async function getAdminListRequestCounts(): Promise<{
  weekly: number;
  fresh: number;
}> {
  const supabase = await getServerSupabase();
  const now = new Date();
  const istanbul = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }),
  );
  const day = (istanbul.getDay() + 6) % 7;
  istanbul.setDate(istanbul.getDate() - day);
  istanbul.setHours(0, 0, 0, 0);

  const [{ count: weekly }, { count: fresh }] = await Promise.all([
    supabase
      .from("list_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", istanbul.toISOString()),
    supabase
      .from("list_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);
  return { weekly: weekly ?? 0, fresh: fresh ?? 0 };
}

/** Admin: tüm hizmetler (aktif/pasif, staff RLS politikasıyla). */
export async function getAdminServices(): Promise<Service[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => mapService(r));
}

/** Admin: sipariş listesi (staff RLS politikasıyla). */
export async function getAdminOrders(status?: string): Promise<Order[]> {
  const supabase = await getServerSupabase();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => mapOrder(r));
}

export async function getAdminOrderCounts(): Promise<{ fresh: number }> {
  const supabase = await getServerSupabase();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return { fresh: count ?? 0 };
}

/** Admin: sipariş detayı + kalemleri. */
export async function getAdminOrder(
  id: string,
): Promise<(Order & { items: OrderItem[] }) | null> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("id, name, quantity, price")
    .eq("order_id", id);
  if (itemsErr) throw new Error(itemsErr.message);
  return {
    ...mapOrder(data),
    items: (items ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      quantity: r.quantity,
      price: r.price,
    })),
  };
}

/** Admin: gelen iletişim mesajları (staff RLS politikasıyla). */
export async function getAdminContactMessages(): Promise<ContactMessage[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    contact: r.contact,
    message: r.message,
    read: r.read,
    createdAt: r.created_at,
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */
