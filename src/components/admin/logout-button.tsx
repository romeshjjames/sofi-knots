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
        className="inline-flex items-center gap-2 rounded-full border border-[#e6ddcf] bg-white px-4 py-2.5 text-sm font-medium text-[#6f5838] shadow-[0_10px_24px_rgba(49,36,23,0.06)] transition hover:bg-[#f9f5ee] hover:text-slate-950"
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
