import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { NotificationsWorkspace } from "@/components/admin/notifications-workspace";
import { getAdminNotifications } from "@/lib/admin-notifications";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminNotificationsPage() {
  await requireAdminPage(["super_admin", "order_admin", "content_admin", "marketing_admin"]);
  const notifications = await getAdminNotifications();

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
    >
      <AdminPanel
        title="Notification center"
        description="Review new orders, custom orders, low stock alerts, return requests, and contact form submissions in one place."
      >
        <NotificationsWorkspace notifications={notifications} />
      </AdminPanel>
    </AdminShell>
  );
}
