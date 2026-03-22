import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { CustomOrderManager } from "@/components/admin/custom-order-manager";
import { getCustomOrders } from "@/lib/custom-orders";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomOrdersPage() {
  await requireAdminPage(["super_admin", "order_admin", "marketing_admin"]);
  const requests = await getCustomOrders();

  return (
    <AdminShell
      active="customOrders"
      eyebrow="Concierge requests"
      title="Custom Orders"
      description="Handle personalized macrame inquiries with a polished high-touch workflow for qualification, quoting, production, and delivery."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Custom Orders" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Open inquiries", value: `${requests.filter((item) => !["completed", "delivered", "rejected", "cancelled"].includes(item.status)).length}`, hint: "Requests still in active motion." },
        { label: "New", value: `${requests.filter((item) => item.status === "new").length}`, hint: "Fresh leads needing first response." },
        { label: "Quoted", value: `${requests.filter((item) => item.status === "quoted" || item.status === "awaiting_approval").length}`, hint: "Requests already in pricing conversation." },
        { label: "In progress", value: `${requests.filter((item) => item.status === "approved" || item.status === "in_progress").length}`, hint: "Custom work currently moving through production." },
      ]}
    >
      <AdminPanel title="Inquiry queue" description="Search, filter, quote, and track bespoke client requests from a cleaner Shopify-style workflow.">
        <CustomOrderManager customOrders={requests} />
      </AdminPanel>
    </AdminShell>
  );
}
