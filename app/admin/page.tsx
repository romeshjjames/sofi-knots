import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, FileText, LineChart, Package, ShoppingCart, SquarePen, Users } from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getAdminAnalytics } from "@/lib/admin-analytics";
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

const quickModuleLinks: {
  title: string;
  description: string;
  href: string;
  icon: typeof Package;
}[] = [
  { title: "Products", description: "Manage pricing, imagery, tags, status, and SEO across the full catalog.", href: "/admin/products", icon: Package },
  { title: "Collections", description: "Organize premium collections, landing pages, and automated merchandising sets.", href: "/admin/collections", icon: Boxes },
  { title: "Orders", description: "Review payment status, fulfillment state, customer issues, and operational notes.", href: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", description: "Track repeat buyers, VIPs, and customer relationship history.", href: "/admin/customers", icon: Users },
  { title: "Content", description: "Publish blog stories, editorial pages, and homepage storytelling content.", href: "/admin/content", icon: FileText },
  { title: "Analytics", description: "Monitor revenue, conversion, traffic, cohorts, and attribution.", href: "/admin/analytics", icon: LineChart },
  { title: "Custom Orders", description: "Handle bespoke client inquiries for premium macrame commissions.", href: "/admin/custom-orders", icon: SquarePen },
];

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const [productsResult, collectionsResult, orders, analytics] = await Promise.all([
    getCatalogProducts(),
    getCatalogCollections(),
    getOrders(),
    getAdminAnalytics(),
  ]);
  const metrics = buildDashboardMetrics({
    products: productsResult.data,
    collections: collectionsResult.data,
    orders,
  });

  return (
    <AdminShell
      active="dashboard"
      eyebrow="Control center"
      title="Store Operations Dashboard"
      description="A Shopify-inspired command center for the full Sofi Knots business: catalog, orders, customers, custom requests, analytics, and editorial publishing."
      stats={[
        { label: "Total sales", value: `Rs. ${metrics.totalSalesInr.toLocaleString("en-IN")}`, hint: "Visible revenue across tracked orders." },
        { label: "Total orders", value: `${metrics.totalOrders}`, hint: "Orders currently available in the admin queue." },
        { label: "Total products", value: `${metrics.totalProducts}`, hint: "Products currently loaded into the active catalog." },
        { label: "Total customers", value: `${metrics.totalCustomers}`, hint: "Profiles currently being tracked in the CRM workspace." },
        { label: "Pending custom orders", value: `${metrics.pendingCustomOrders}`, hint: "Concierge requests waiting on action." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel title="Quick actions" description="Jump into the most important workflows without hunting through the navigation.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quickModuleLinks.map(({ title, description, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <ArrowRight size={18} className="text-slate-400 transition group-hover:text-slate-700" />
                </div>
                <h3 className="mt-5 font-serif text-2xl text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Best sellers" description="Products currently driving the strongest sales response.">
            <div className="space-y-3">
              {metrics.bestSellers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#fbfcfd] p-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{index + 1}. {item.name}</p>
                    <p className="mt-1 text-slate-500">{item.unitsSold} units sold</p>
                  </div>
                  <p className="font-medium text-slate-900">Rs. {item.revenueInr.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Collection performance" description="Quick read on which collection stories are converting best.">
            <div className="space-y-3">
              {metrics.collectionPerformance.map((collection) => (
                <div key={collection.id} className="rounded-2xl border border-[#e7eaee] bg-white p-4">
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
        <AdminPanel title="Recent orders" description="Most recent customer purchases requiring review or fulfillment.">
          <div className="overflow-hidden rounded-[24px] border border-[#e7eaee]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbfcfd] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Total</th>
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

          <AdminPanel title="Revenue chart" description="A simple weekly pulse for the most recent sales cycle.">
            <div className="grid h-[240px] grid-cols-7 items-end gap-3">
              {metrics.revenueSeries.map((point) => {
                const height = Math.max(20, Math.round(point.revenue / 420));
                return (
                  <div key={point.label} className="flex h-full flex-col justify-end gap-3">
                    <div className="rounded-t-2xl bg-slate-900/90" style={{ height }} />
                    <div className="text-center text-xs text-slate-500">{point.label}</div>
                  </div>
                );
              })}
            </div>
          </AdminPanel>
        </div>
      </div>

      <div className="mt-6">
        <AnalyticsDashboard
          rangeSnapshots={analytics.rangeSnapshots}
          defaultRange={analytics.defaultRange}
          categorySeries={analytics.categorySeries}
          featuredProducts={analytics.featuredProducts}
          recentActivity={analytics.recentActivity}
          contentHealth={analytics.contentHealth}
          rawOrders={analytics.rawOrders}
          rawEvents={analytics.rawEvents}
          rawOrderItems={analytics.rawOrderItems}
        />
      </div>
    </AdminShell>
  );
}
