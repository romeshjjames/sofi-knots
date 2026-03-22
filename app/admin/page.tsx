import type { Metadata } from "next";
import Link from "next/link";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { buildDashboardMetrics } from "@/lib/admin-suite-data";
import { getCatalogCollections, getCatalogProducts } from "@/lib/catalog";
import { getOrders } from "@/lib/orders";
import { buildMetadata } from "@/lib/seo";
import { requireAdminPage } from "@/lib/supabase/auth";

export const metadata: Metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "Premium ecommerce dashboard for catalog, orders, customers, content, and analytics across the Sofi Knots store.",
  path: "/admin",
  keywords: ["shopify style admin dashboard", "ecommerce operations admin", "premium store dashboard"],
});

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const [productsResult, collectionsResult, orders] = await Promise.all([
    getCatalogProducts(),
    getCatalogCollections(),
    getOrders(),
  ]);
  const metrics = buildDashboardMetrics({
    products: productsResult.data,
    collections: collectionsResult.data,
    orders,
  });
  const openOrders = orders.filter((order) => order.fulfillmentStatus !== "delivered" && order.status !== "cancelled").length;

  return (
    <AdminShell
      active="dashboard"
      eyebrow="Control center"
      title="Store Operations Dashboard"
      description="A tighter executive view of catalog, orders, custom requests, and revenue so the most important store operations stay visible at a glance."
      statsVariant="compact"
      stats={[
        { label: "Total sales", value: `Rs. ${metrics.totalSalesInr.toLocaleString("en-IN")}`, hint: "Visible revenue across tracked orders." },
        { label: "Total orders", value: `${metrics.totalOrders}`, hint: "Orders currently available in the admin queue." },
        { label: "Total products", value: `${metrics.totalProducts}`, hint: "Products currently loaded into the active catalog." },
        { label: "Total customers", value: `${metrics.totalCustomers}`, hint: "Profiles currently being tracked in the CRM workspace." },
        { label: "Pending custom orders", value: `${metrics.pendingCustomOrders}`, hint: "Concierge requests waiting on action." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <AdminPanel title="Best sellers" description="The products currently driving the strongest revenue.">
            <div className="space-y-3">
              {metrics.bestSellers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#fbfcfd] px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{index + 1}. {item.name}</p>
                    <p className="mt-1 text-slate-500">{item.unitsSold} units sold</p>
                  </div>
                  <p className="font-medium text-slate-900">Rs. {item.revenueInr.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Collection performance" description="A compact view of the collection stories converting best.">
            <div className="space-y-3">
              {metrics.collectionPerformance.map((collection) => (
                <div key={collection.id} className="rounded-2xl border border-[#e7eaee] bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-slate-900">{collection.name}</p>
                    <AdminBadge tone="info">{collection.conversionRate}% CVR</AdminBadge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                    <span>{collection.visits.toLocaleString("en-IN")} visits</span>
                    <span>Rs. {collection.revenueInr.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <AdminPanel title="Recent orders" description="Recent purchases that need review or fulfillment.">
          <div className="overflow-hidden rounded-[24px] border border-[#e7eaee]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbfcfd] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-[#eef1f4] bg-white">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{order.orderNumber}</div>
                      <div className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <div>{order.customerName}</div>
                      <div className="mt-1 text-xs text-slate-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <AdminBadge tone={order.paymentStatus === "paid" ? "success" : order.paymentStatus === "failed" ? "danger" : "warning"}>
                        {order.paymentStatus}
                      </AdminBadge>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">Rs. {order.totalInr.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Low stock products" description="Products that may block sales if replenishment is delayed.">
            <div className="space-y-3">
              {metrics.lowStock.length ? (
                metrics.lowStock.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[#fbfcfd] p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <AdminBadge tone={item.status === "out" ? "danger" : "warning"}>{item.status === "out" ? "Out of stock" : "Low stock"}</AdminBadge>
                    </div>
                    <p className="mt-2 text-slate-600">{item.stock} in stock • {item.incoming} incoming</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-6 text-sm text-slate-600">
                  No low-stock alerts right now.
                </div>
              )}
            </div>
          </AdminPanel>

          <AdminPanel title="Revenue pulse" description="A light weekly pulse for the latest sales cycle.">
            <div className="grid h-[180px] grid-cols-7 items-end gap-2">
              {metrics.revenueSeries.map((point) => {
                const height = Math.max(18, Math.round(point.revenue / 520));
                return (
                  <div key={point.label} className="flex h-full flex-col justify-end gap-2">
                    <div className="rounded-t-2xl bg-gradient-to-t from-[#b98d45] to-[#d7b271]" style={{ height }} />
                    <div className="text-center text-[11px] text-slate-500">{point.label}</div>
                  </div>
                );
              })}
            </div>
          </AdminPanel>
        </div>
      </div>

      <div className="mt-6">
        <AdminPanel title="Operational priorities" description="The most important next actions for the store team.">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Fulfillment queue</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{openOrders}</p>
              <p className="mt-1 text-sm text-slate-600">Orders still needing packaging, dispatch, or delivery updates.</p>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Catalog watch</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{metrics.lowStock.length}</p>
              <p className="mt-1 text-sm text-slate-600">Products that should be reviewed for stock or merchandising attention.</p>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Custom requests</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{metrics.pendingCustomOrders}</p>
              <p className="mt-1 text-sm text-slate-600">Custom or concierge orders waiting on a response or quote.</p>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Reporting</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">Analytics</p>
              <p className="mt-1 text-sm text-slate-600">Use the dedicated analytics module for funnels, traffic, cohorts, and exports.</p>
            </div>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
