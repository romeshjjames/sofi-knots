import Link from "next/link";
import { Bell, Boxes, ClipboardList, Mail, RotateCcw, TriangleAlert } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { AdminNotificationKind, AdminNotificationRecord } from "@/lib/admin-notifications";

const kindConfig: Record<
  AdminNotificationKind,
  { label: string; icon: typeof Bell; tone: "info" | "warning" | "danger" | "success" }
> = {
  new_order: { label: "New order", icon: ClipboardList, tone: "success" },
  new_custom_order: { label: "Custom order", icon: Boxes, tone: "info" },
  low_stock: { label: "Low stock", icon: TriangleAlert, tone: "warning" },
  return_request: { label: "Return request", icon: RotateCcw, tone: "danger" },
  contact_message: { label: "Contact message", icon: Mail, tone: "info" },
};

export function NotificationsCenter({ notifications }: { notifications: AdminNotificationRecord[] }) {
  if (!notifications.length) {
    return (
      <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-10 text-center text-sm text-slate-500">
        No operational alerts right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const config = kindConfig[notification.kind];
        const Icon = config.icon;

        return (
          <Link
            key={notification.id}
            href={notification.href}
            className="flex items-start gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5 shadow-sm transition hover:border-[#d9dee5] hover:bg-[#fbfcfd]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbfcfd] text-slate-600">
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                <AdminBadge tone={config.tone}>{config.label}</AdminBadge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{notification.description}</p>
            </div>
            <div className="shrink-0 text-xs text-slate-400">
              {new Date(notification.createdAt).toLocaleString("en-IN")}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
