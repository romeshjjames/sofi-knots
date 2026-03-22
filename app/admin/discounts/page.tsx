import { Plus } from "lucide-react";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getSampleDiscounts } from "@/lib/admin-suite-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminDiscountsPage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const discounts = getSampleDiscounts();

  return (
    <AdminShell
      active="discounts"
      eyebrow="Offers and promotions"
      title="Discounts"
      description="Create, review, and schedule promotions with a clean commerce workflow for launches, premium drops, and first-order conversion."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Discounts" },
      ]}
      actions={
        <button type="button" className="rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
          <span className="inline-flex items-center gap-2"><Plus size={16} /> Create discount</span>
        </button>
      }
      stats={[
        { label: "Active codes", value: `${discounts.filter((item) => item.status === "active").length}`, hint: "Live offers customers can redeem right now." },
        { label: "Scheduled", value: `${discounts.filter((item) => item.status === "scheduled").length}`, hint: "Promotions queued for future publishing." },
        { label: "Highest incentive", value: "Rs. 750", hint: "Most valuable fixed-amount offer in the stack." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminPanel title="Promotion library" description="All live and scheduled coupon logic, from welcome offers to collection-specific incentives.">
          <div className="overflow-hidden rounded-[24px] border border-[#e7eaee]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbfcfd] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Code</th>
                  <th className="px-5 py-4 font-medium">Type</th>
                  <th className="px-5 py-4 font-medium">Offer</th>
                  <th className="px-5 py-4 font-medium">Usage</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((discount) => (
                  <tr key={discount.id} className="border-t border-[#eef1f4] bg-white">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{discount.code}</div>
                      <div className="mt-1 text-xs text-slate-500">{discount.appliesTo}</div>
                    </td>
                    <td className="px-5 py-4 capitalize text-slate-600">{discount.type.replace("_", " ")}</td>
                    <td className="px-5 py-4 text-slate-700">
                      <div>{discount.value}</div>
                      <div className="mt-1 text-xs text-slate-500">Min {discount.minimumOrder}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{discount.usage}</td>
                    <td className="px-5 py-4">
                      <AdminBadge tone={discount.status === "active" ? "success" : discount.status === "scheduled" ? "info" : "warning"}>
                        {discount.status}
                      </AdminBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel title="Create discount" description="A polished draft form inspired by Shopify-style promotion setup.">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm text-slate-600">
              Discount code
              <input defaultValue="SPRINGKNOTS15" className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 outline-none" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-600">
                Type
                <select className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 outline-none">
                  <option>Percentage</option>
                  <option>Fixed amount</option>
                  <option>Free shipping</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                Value
                <input defaultValue="15%" className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 outline-none" />
              </label>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-600">
                Minimum order
                <input defaultValue="4500" className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 outline-none" />
              </label>
              <label className="grid gap-2 text-sm text-slate-600">
                Expiry date
                <input type="date" className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 outline-none" />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-600">
              Usage limit
              <input defaultValue="200" className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 outline-none" />
            </label>
            <div className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-600">
              <span>Active status</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Active</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" className="rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white">Save discount</button>
              <button type="button" className="rounded-2xl border border-[#e7eaee] px-5 py-3 text-sm font-medium text-slate-700">Save as draft</button>
            </div>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
