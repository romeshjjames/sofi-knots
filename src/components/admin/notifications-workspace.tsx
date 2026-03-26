"use client";

import { useMemo, useState } from "react";
import { NotificationsCenter } from "@/components/admin/notifications-center";
import type { AdminNotificationRecord } from "@/lib/admin-notifications";

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-3.5 py-3 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1 text-[1.9rem] font-semibold leading-none tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-600">{hint}</p>
    </div>
  );
}

export function NotificationsWorkspace({ notifications }: { notifications: AdminNotificationRecord[] }) {
  const [items, setItems] = useState(notifications);

  const summary = useMemo(() => {
    return {
      total: items.length,
      unread: items.filter((item) => !item.isRead).length,
      newOrders: items.filter((item) => item.kind === "new_order").length,
      customOrders: items.filter((item) => item.kind === "new_custom_order").length,
      lowStock: items.filter((item) => item.kind === "low_stock").length,
    };
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Alerts" value={`${summary.total}`} hint="Operational alerts currently visible." />
        <StatCard label="Unread" value={`${summary.unread}`} hint="Notifications still needing review." />
        <StatCard label="Orders" value={`${summary.newOrders}`} hint="Recent order activity needing awareness." />
        <StatCard label="Custom" value={`${summary.customOrders}`} hint="Custom-order requests to review." />
        <StatCard label="Low stock" value={`${summary.lowStock}`} hint="Products needing stock action." />
      </div>

      <NotificationsCenter items={items} onItemsChange={setItems} />
    </div>
  );
}
