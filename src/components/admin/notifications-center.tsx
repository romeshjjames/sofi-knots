"use client";

import { useMemo, useState } from "react";
import { Bell, Boxes, CheckCheck, ClipboardList, Mail, RotateCcw, TriangleAlert, Trash2 } from "lucide-react";
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

export function NotificationsCenter({
  notifications,
  onItemsChange,
}: {
  notifications: AdminNotificationRecord[];
  onItemsChange?: React.Dispatch<React.SetStateAction<AdminNotificationRecord[]>>;
}) {
  const [items, setItems] = useState(notifications);
  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);
  const allRead = items.length > 0 && unreadCount === 0;

  function syncItems(updater: (current: AdminNotificationRecord[]) => AdminNotificationRecord[]) {
    setItems((current) => {
      const next = updater(current);
      onItemsChange?.(next);
      return next;
    });
  }

  async function updateNotification(notificationId: string, input: { isRead?: boolean; deleted?: boolean }) {
    const response = await fetch(`/api/admin/notifications/${notificationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) return false;

    window.dispatchEvent(new Event("admin-notifications-changed"));

    if (input.deleted) {
      syncItems((current) => current.filter((item) => item.id !== notificationId));
      return true;
    }

    syncItems((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, isRead: input.isRead === true } : item)),
    );
    return true;
  }

  async function openNotification(notification: AdminNotificationRecord) {
    if (!notification.isRead) {
      const ok = await updateNotification(notification.id, { isRead: true, deleted: false });
      if (!ok) return;
    }
    window.location.href = notification.href;
  }

  async function toggleAll() {
    const targetRead = !allRead;
    const changedItems = items.filter((item) => item.isRead !== targetRead);
    if (!changedItems.length) return;

    const results = await Promise.all(
      changedItems.map((item) =>
        fetch(`/api/admin/notifications/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: targetRead, deleted: false }),
        }),
      ),
    );

    if (results.some((result) => !result.ok)) return;

    window.dispatchEvent(new Event("admin-notifications-changed"));
    syncItems((current) => current.map((item) => ({ ...item, isRead: targetRead })));
  }

  if (!items.length) {
    return (
      <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-10 text-center text-sm text-slate-500">
        No operational alerts right now.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] px-5 py-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Notifications</p>
          <p className="mt-1 text-sm text-slate-500">{unreadCount} unread alerts</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          onClick={() => void toggleAll()}
        >
          <CheckCheck size={16} />
          {allRead ? "Mark all unread" : "Mark all read"}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((notification) => {
          const config = kindConfig[notification.kind];
          const Icon = config.icon;

          return (
            <div
              key={notification.id}
              className={`flex items-start gap-4 rounded-[24px] border p-5 shadow-sm transition ${
                notification.isRead
                  ? "border-[#e7eaee] bg-white"
                  : "border-[#d8e5f4] bg-[#f8fbff]"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fbfcfd] text-slate-600">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-slate-900 hover:text-slate-700"
                    onClick={() => void openNotification(notification)}
                  >
                    {notification.title}
                  </button>
                  <AdminBadge tone={config.tone}>{config.label}</AdminBadge>
                  {!notification.isRead ? <AdminBadge tone="info">Unread</AdminBadge> : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notification.description}</p>
              </div>
              <div className="flex shrink-0 items-start gap-2">
                <div className="pt-2 text-xs text-slate-400">
                  {new Date(notification.createdAt).toLocaleString("en-IN")}
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  title={notification.isRead ? "Mark unread" : "Mark read"}
                  onClick={() => void updateNotification(notification.id, { isRead: !notification.isRead, deleted: false })}
                >
                  <CheckCheck size={16} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50"
                  title="Delete notification"
                  onClick={() => void updateNotification(notification.id, { isRead: notification.isRead, deleted: true })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
