"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Profile } from "@db/queries";
import { updateUserRoleAction } from "@/lib/actions/users";
import { ABadge, AButton, ACard, AConfirm } from "./ui";

export function UsersManager({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{
    id: string;
    role: "owner" | "editor";
    label: string;
  } | null>(null);

  const changeRole = () => {
    if (!confirm) return;
    startTransition(async () => {
      const res = await updateUserRoleAction({
        id: confirm.id,
        role: confirm.role,
      });
      if ("error" in res) toast.error(res.error);
      else {
        toast.success("Rol güncellendi");
        router.refresh();
      }
      setConfirm(null);
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Kullanıcılar
      </h1>

      <ACard className="p-4 text-sm text-[var(--ink-soft)]">
        <strong className="text-[var(--ink)]">Yeni kullanıcı eklemek:</strong>{" "}
        Supabase panelinde <em>Authentication → Users → Add user</em> ile
        e-posta/şifre oluşturun; kullanıcı ilk girişinde otomatik{" "}
        <strong>editor</strong> rolüyle listeye eklenir. Rolünü buradan
        değiştirebilirsiniz. <strong>editor</strong> ayarlara ve kullanıcılar
        sayfasına erişemez.
      </ACard>

      <div className="overflow-x-auto rounded-lg border border-[var(--line)] bg-[var(--paper)]">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-[var(--ink-muted)]">
              <th className="px-3 py-2.5">E-posta</th>
              <th className="px-3 py-2.5">Ad</th>
              <th className="px-3 py-2.5">Rol</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr
                key={p.id}
                className="border-b border-[var(--line)] last:border-0"
              >
                <td className="px-3 py-2.5">
                  {p.email}
                  {p.id === currentUserId && (
                    <span className="ml-2 text-xs text-[var(--ink-muted)]">
                      (siz)
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5">{p.name || "—"}</td>
                <td className="px-3 py-2.5">
                  <ABadge tone={p.role === "owner" ? "yellow" : "blue"}>
                    {p.role}
                  </ABadge>
                </td>
                <td className="px-3 py-2.5 text-right">
                  {p.id !== currentUserId && (
                    <AButton
                      variant="ghost"
                      disabled={pending}
                      onClick={() =>
                        setConfirm({
                          id: p.id,
                          role: p.role === "owner" ? "editor" : "owner",
                          label: `${p.email} → ${p.role === "owner" ? "editor" : "owner"}`,
                        })
                      }
                    >
                      {p.role === "owner" ? "Editor yap" : "Owner yap"}
                    </AButton>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AConfirm
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={changeRole}
        title="Rol değiştirilsin mi?"
        body={`${confirm?.label ?? ""} olarak güncellenecek.`}
        confirmLabel="Değiştir"
      />
    </div>
  );
}
