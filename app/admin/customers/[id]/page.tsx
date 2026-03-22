import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CustomerEditor } from "@/components/admin/customer-editor";
import { getCustomerById } from "@/lib/customers";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "marketing_admin", "order_admin"]);
  const customer = await getCustomerById(params.id);

  if (!customer) notFound();

  return (
    <AdminShell
      active="customers"
      eyebrow="Customer detail"
      title={customer.fullName}
      description="Review customer information, tags, notes, addresses, order history, and timeline from one customer profile."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Customers", href: "/admin/customers" },
        { label: customer.fullName },
      ]}
      actions={
        <Link href="/admin/customers" className="brand-btn-outline px-5 py-3">
          Back to customers
        </Link>
      }
      statsVariant="compact"
      stats={[
        { label: "Orders", value: `${customer.orderCount}`, hint: "Total historical purchases." },
        { label: "Spent", value: `Rs. ${customer.totalSpentInr.toLocaleString("en-IN")}`, hint: "Lifetime order value from this customer." },
        { label: "AOV", value: `Rs. ${customer.averageOrderValueInr.toLocaleString("en-IN")}`, hint: "Average order value across this customer history." },
        { label: "Tags", value: `${customer.tags.length}`, hint: "Segments currently assigned." },
      ]}
    >
      <CustomerEditor customer={customer} mode="edit" />
    </AdminShell>
  );
}
