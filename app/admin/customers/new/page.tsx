import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { CustomerEditor } from "@/components/admin/customer-editor";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomerCreatePage() {
  await requireAdminPage(["super_admin", "marketing_admin", "order_admin"]);

  return (
    <AdminShell
      active="customers"
      eyebrow="Customer detail"
      title="Add customer"
      description="Create a customer manually with contact details, saved addresses, notes, and segmentation tags."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Customers", href: "/admin/customers" },
        { label: "Add customer" },
      ]}
      actions={
        <Link href="/admin/customers" className="brand-btn-outline px-5 py-3">
          Back to customers
        </Link>
      }
    >
      <CustomerEditor mode="create" />
    </AdminShell>
  );
}
