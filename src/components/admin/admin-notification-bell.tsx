"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

type NotificationSummary = {
  total: number;
  unread: number;
};

export function AdminNotificationBell({ initialUnread = 0 }: { initialUnread?: number }) {
  const [summary, setSummary] = useState<NotificationSummary>({
    total: initialUnread,
    unread: initialUnread,
  });

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const response = await fetch("/api/admin/notifications/summary", { cache: "no-store" });
        if (!response.ok) return;
        const body = (await response.json()) as NotificationSummary;
        if (mounted) {
          setSummary(body);
        }
      } catch {
        // Ignore transient refresh errors in the header.
      }
    }

    void refresh();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    const onChanged = () => {
      void refresh();
    };

    window.addEventListener("focus", onChanged);
    window.addEventListener("admin-notifications-changed", onChanged as EventListener);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onChanged);
      window.removeEventListener("admin-notifications-changed", onChanged as EventListener);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <Link
      href="/admin/notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e6ddcf] bg-white text-[#7f6a49] shadow-[0_10px_24px_rgba(49,36,23,0.06)] transition hover:bg-[#f9f5ee]"
    >
      <Bell size={18} />
      {summary.unread > 0 ? (
        <>
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-[#1f2933] px-1.5 py-0.5 text-center text-[10px] font-medium text-white">
            {summary.unread > 99 ? "99+" : summary.unread}
          </span>
        </>
      ) : null}
    </Link>
  );
}
