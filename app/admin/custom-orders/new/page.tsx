import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { CustomOrderEditor } from "@/components/admin/custom-order-editor";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomOrderCreatePage() {
  await requireAdminPage(["super_admin", "order_admin", "marketing_admin"]);

  return (
    <AdminShell
      active="customOrders"
      eyebrow="Inquiry detail"
      title="Add custom order"
      description="Create a bespoke order request manually with customer details, quote context, production notes, and workflow status."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Custom Orders", href: "/admin/custom-orders" },
        { label: "Add custom order" },
      ]}
      actions={
        <Link href="/admin/custom-orders" className="brand-btn-outline px-5 py-3">
          Back to inquiries
        </Link>
      }
    >
      <CustomOrderEditor mode="create" />
    </AdminShell>
  );
}
