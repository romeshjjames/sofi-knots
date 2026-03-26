import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { NotificationsCenter } from "@/components/admin/notifications-center";
import { getAdminNotifications, getAdminNotificationSummary } from "@/lib/admin-notifications";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminNotificationsPage() {
  await requireAdminPage(["super_admin", "order_admin", "content_admin", "marketing_admin"]);
  const [notifications, summary] = await Promise.all([
    getAdminNotifications(),
    getAdminNotificationSummary(),
  ]);

  return (
    <AdminShell
      active="notifications"
      eyebrow="Notification center"
      title="Notifications"
      description="Track new orders, custom orders, low stock alerts, return requests, and contact form messages from one operational inbox."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Notifications" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Alerts", value: `${summary.total}`, hint: "Operational alerts currently visible." },
        { label: "Unread", value: `${summary.unread}`, hint: "Notifications still needing review." },
        { label: "Orders", value: `${summary.newOrders}`, hint: "Recent order activity needing awareness." },
        { label: "Custom", value: `${summary.customOrders}`, hint: "Custom-order requests to review." },
        { label: "Low stock", value: `${summary.lowStock}`, hint: "Products needing stock action." },
      ]}
    >
      <AdminPanel
        title="Notification center"
        description="Review new orders, custom orders, low stock alerts, return requests, and contact form submissions in one place."
      >
        <NotificationsCenter notifications={notifications} />
      </AdminPanel>
    </AdminShell>
  );
}
