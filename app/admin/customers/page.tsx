import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { CustomerManager } from "@/components/admin/customer-manager";
import { getCustomers } from "@/lib/customers";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomersPage() {
  await requireAdminPage(["super_admin", "marketing_admin", "order_admin"]);
  const customers = await getCustomers();

  return (
    <AdminShell
      active="customers"
      eyebrow="Customer relationships"
      title="Customers"
      description="Manage customer profiles, segmentation, order history, notes, and saved addresses from one Shopify-style CRM workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Customers" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Customer profiles", value: `${customers.length}`, hint: "Store contacts currently visible to the admin team." },
        { label: "VIP customers", value: `${customers.filter((customer) => customer.tags.includes("VIP")).length}`, hint: "Priority customers worth white-glove follow-up." },
        { label: "Repeat buyers", value: `${customers.filter((customer) => customer.orderCount > 1).length}`, hint: "Customers who have ordered more than once." },
        { label: "Tagged", value: `${customers.filter((customer) => customer.tags.length > 0).length}`, hint: "Customers grouped into segments or lists." },
      ]}
    >
      <AdminPanel title="Customer directory" description="Search, filter, segment, and open customer profiles from a cleaner customer management workspace.">
        <CustomerManager customers={customers} />
      </AdminPanel>
    </AdminShell>
  );
}
