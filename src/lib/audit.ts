import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  actorEmail: string,
  action: string,
  entity: string,
  entityId?: string | null,
  meta: Record<string, unknown> = {},
) {
  await supabase.from("audit_logs").insert({
    actor_email: actorEmail,
    action,
    entity,
    entity_id: entityId ?? null,
    meta,
  });
}
