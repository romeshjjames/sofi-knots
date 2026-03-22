import Link from "next/link";
import { ChevronRight, Mail, Phone, Star } from "lucide-react";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getSampleCustomers } from "@/lib/admin-suite-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomersPage() {
  await requireAdminPage(["super_admin", "marketing_admin", "order_admin"]);
  const customers = getSampleCustomers();
  const topCustomer = customers[0];

  return (
    <AdminShell
      active="customers"
      eyebrow="Customer relationships"
      title="Customers"
      description="Track high-value buyers, repeat customers, wishlist patterns, and service notes from one clean CRM-style workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Customers" },
      ]}
      stats={[
        { label: "Customer profiles", value: `${customers.length}`, hint: "Store contacts currently visible to the admin team." },
        { label: "VIP customers", value: `${customers.filter((customer) => customer.tags.includes("VIP")).length}`, hint: "Priority customers worth white-glove follow-up." },
        { label: "Repeat buyers", value: `${customers.filter((customer) => customer.orderCount > 1).length}`, hint: "Customers who have ordered more than once." },
        { label: "Top lifetime spend", value: `Rs. ${Math.max(...customers.map((customer) => customer.totalSpentInr)).toLocaleString("en-IN")}`, hint: "Best current customer value in this workspace." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel title="Customer directory" description="Searchable account list with spend, tags, and activity signals similar to a modern commerce CRM.">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-500">
              <span>Search customers, tags, or email</span>
            </div>
            <div className="flex gap-2 text-sm">
              <button type="button" className="rounded-xl border border-[#e7eaee] px-3 py-2 text-slate-600">All</button>
              <button type="button" className="rounded-xl border border-[#e7eaee] px-3 py-2 text-slate-600">VIP</button>
              <button type="button" className="rounded-xl border border-[#e7eaee] px-3 py-2 text-slate-600">Newsletter</button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-[#e7eaee]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbfcfd] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Orders</th>
                  <th className="px-5 py-4 font-medium">Total spent</th>
                  <th className="px-5 py-4 font-medium">Tags</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t border-[#eef1f4] bg-white">
                    <td className="px-5 py-4 align-top">
                      <div className="font-medium text-slate-900">{customer.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{customer.email}</div>
                      <div className="mt-1 text-xs text-slate-500">{customer.phone}</div>
                    </td>
                    <td className="px-5 py-4 align-top text-slate-700">{customer.orderCount}</td>
                    <td className="px-5 py-4 align-top font-medium text-slate-900">Rs. {customer.totalSpentInr.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {customer.tags.map((tag) => (
                          <AdminBadge key={tag} tone={tag === "VIP" ? "success" : "default"}>
                            {tag}
                          </AdminBadge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <Link href={`/admin/customers/${customer.id}`} className="inline-flex items-center gap-1 font-medium text-slate-700 transition hover:text-slate-950">
                        View
                        <ChevronRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Featured customer" description="A quick profile card for your highest-value buyer this month.">
            <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-serif text-2xl text-slate-950">{topCustomer.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Joined {new Date(topCustomer.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <AdminBadge tone="success">VIP</AdminBadge>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Mail size={15} /> {topCustomer.email}</div>
                <div className="flex items-center gap-2"><Phone size={15} /> {topCustomer.phone}</div>
                <div className="flex items-center gap-2"><Star size={15} /> Rs. {topCustomer.totalSpentInr.toLocaleString("en-IN")} lifetime value</div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">{topCustomer.notes}</p>
            </div>
          </AdminPanel>

          <AdminPanel title="Retention notes" description="High-signal prompts for keeping repeat buyers warm.">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-[#fbfcfd] p-4">Send an early-access preview to VIP buyers before the next Premium Collection drop.</div>
              <div className="rounded-2xl bg-[#fbfcfd] p-4">Offer care-guide follow-up emails to first-time customers within 7 days of delivery.</div>
              <div className="rounded-2xl bg-[#fbfcfd] p-4">Segment custom-order leads into a dedicated concierge outreach list.</div>
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
