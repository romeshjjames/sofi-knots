"use client";

import { useState, useTransition } from "react";
import type { StaffMemberRecord } from "@/lib/admin-data";

type Props = {
  staff: StaffMemberRecord[];
};

const allRoles = ["super_admin", "catalog_admin", "order_admin", "content_admin", "marketing_admin"] as const;

export function StaffPermissionsManager({ staff }: Props) {
  const [members, setMembers] = useState(staff);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {members.map((member) => (
        <div key={member.id} className="rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-medium text-brand-brown">{member.fullName || "Unnamed user"}</div>
              <div className="text-sm text-brand-warm">{member.email || "No email"}</div>
            </div>
            <button
              type="button"
              className="brand-btn-outline px-4 py-2"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const response = await fetch("/api/admin/staff", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: member.id, roles: member.roles }),
                  });
                  const body = await response.json();
                  setMessage(response.ok ? `Roles saved for ${member.email || member.fullName || member.id}.` : body.error || "Failed to save roles.");
                })
              }
            >
              Save roles
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {allRoles.map((role) => (
              <label key={role} className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 bg-white px-4 py-3 text-sm text-brand-brown">
                <input
                  type="checkbox"
                  checked={member.roles.includes(role)}
                  onChange={(event) =>
                    setMembers((current) =>
                      current.map((entry) =>
                        entry.id !== member.id
                          ? entry
                          : {
                              ...entry,
                              roles: event.target.checked
                                ? [...new Set([...entry.roles, role])]
                                : entry.roles.filter((value) => value !== role),
                            },
                      ),
                    )
                  }
                />
                {role}
              </label>
            ))}
          </div>
        </div>
      ))}
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
