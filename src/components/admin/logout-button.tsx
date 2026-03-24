"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950"
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const response = await fetch("/api/admin/logout", { method: "POST" });
            if (!response.ok) {
              setMessage("Logout failed.");
              return;
            }
            window.location.href = "/admin/login";
          });
        }}
      >
        <LogOut size={16} />
        {isPending ? "Logging out..." : "Logout"}
      </button>
      {message ? <p className="text-xs text-rose-600">{message}</p> : null}
    </div>
  );
}
