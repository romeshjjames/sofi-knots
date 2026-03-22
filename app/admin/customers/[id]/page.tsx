import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getSampleCustomerById } from "@/lib/admin-suite-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "marketing_admin", "order_admin"]);
  const customer = getSampleCustomerById(params.id);

  if (!customer) notFound();

  return (
    <AdminShell
      active="customers"
      eyebrow="Customer detail"
      title={customer.name}
      description="Profile, order-value context, saved addresses, wishlist behavior, and service notes for this customer."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Customers", href: "/admin/customers" },
        { label: customer.name },
      ]}
      actions={
        <Link href="/admin/customers" className="brand-btn-outline px-5 py-3">
          Back to customers
        </Link>
      }
      stats={[
        { label: "Orders", value: `${customer.orderCount}`, hint: "Total historical purchases." },
        { label: "Spent", value: `Rs. ${customer.totalSpentInr.toLocaleString("en-IN")}`, hint: "Lifetime order value from this customer." },
        { label: "Tags", value: `${customer.tags.length}`, hint: "Segments currently assigned." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <AdminPanel title="Profile" description="Core contact details and CRM segmentation.">
            <div className="space-y-3 text-sm text-slate-600">
              <div><span className="font-medium text-slate-900">Email:</span> {customer.email}</div>
              <div><span className="font-medium text-slate-900">Phone:</span> {customer.phone}</div>
              <div><span className="font-medium text-slate-900">Joined:</span> {new Date(customer.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              <div className="flex flex-wrap gap-2 pt-2">
                {customer.tags.map((tag) => (
                  <AdminBadge key={tag} tone={tag === "VIP" ? "success" : "default"}>
                    {tag}
                  </AdminBadge>
                ))}
              </div>
            </div>
          </AdminPanel>
          <AdminPanel title="Saved addresses" description="Shipping and billing addresses saved on this profile.">
            <div className="grid gap-4 lg:grid-cols-2">
              {customer.addresses.map((address) => (
                <div key={address.label} className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4 text-sm text-slate-600">
                  <p className="font-medium text-slate-900">{address.label}</p>
                  <div className="mt-2 space-y-1">
                    {address.value.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
        <div className="space-y-6">
          <AdminPanel title="Wishlist and preferences" description="Use these notes to personalize outreach and merchandising.">
            <div className="space-y-3">
              {customer.wishlist.map((item) => (
                <div key={item} className="rounded-2xl bg-[#fbfcfd] p-4 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </AdminPanel>
          <AdminPanel title="Internal notes" description="Service context, follow-up prompts, and relationship history.">
            <p className="text-sm leading-6 text-slate-600">{customer.notes}</p>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
