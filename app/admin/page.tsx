import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Package, ShoppingCart, Sparkles } from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { getCatalogProducts } from "@/lib/catalog";
import { getOrders } from "@/lib/orders";
import { buildMetadata } from "@/lib/seo";
import { requireAdminPage } from "@/lib/supabase/auth";

export const metadata: Metadata = buildMetadata({
  title: "Admin Dashboard",
  description: "Manage catalog, orders, pages, blog content, and SEO settings from the Sofi Knots admin dashboard.",
  path: "/admin",
  keywords: ["admin dashboard ecommerce", "catalog admin", "seo cms admin"],
});

const adminModules: {
  title: string;
  description: string;
  href: string;
  icon: typeof Package;
}[] = [
  { title: "Products", description: "Manage products, pricing, media, merchandising, collections, and category structure.", href: "/admin/products", icon: Package },
  { title: "Orders", description: "Track payment status, fulfillment, customer issues, and post-purchase workflows.", href: "/admin/orders", icon: ShoppingCart },
  { title: "SEO", description: "Control metadata, canonicals, structured data targets, and ranking-focused page fields.", href: "/admin/seo", icon: Sparkles },
  { title: "Content", description: "Handle blog posts, FAQs, landing pages, and homepage storytelling modules.", href: "/admin/content", icon: FileText },
];

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const [productsResult, orders, analytics] = await Promise.all([getCatalogProducts(), getOrders(), getAdminAnalytics()]);
  const activeProducts = productsResult.data.filter((item) => item.status !== "archived");
  const paidOrders = orders.filter((item) => item.paymentStatus === "paid");
  const grossRevenue = orders.reduce((sum, order) => sum + order.totalInr, 0);

  return (
    <AdminShell
      active="dashboard"
      eyebrow="Control center"
      title="Store Operations Dashboard"
      description="A more robust admin workspace for daily operations, catalog merchandising, payment visibility, and growth tasks. This is the foundation for a richer Shopify-style back office."
      stats={[
        { label: "Active products", value: `${activeProducts.length}`, hint: "Live catalog records ready for merchandising." },
        { label: "Orders", value: `${orders.length}`, hint: "Orders currently visible in the operational queue." },
        { label: "Paid orders", value: `${paidOrders.length}`, hint: "Customer payments successfully captured." },
        { label: "Gross revenue", value: `Rs. ${grossRevenue.toLocaleString("en-IN")}`, hint: "Revenue represented by tracked orders." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel
          title="Operations workspace"
          description="Jump into the areas a growing ecommerce team touches most: catalog, order handling, SEO operations, and content publishing."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {adminModules.map(({ title, description, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-[24px] border border-brand-sand/50 bg-[#fcfaf5] p-5 transition hover:-translate-y-0.5 hover:border-brand-gold/50 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
                    <Icon size={20} />
                  </div>
                  <ArrowRight size={18} className="text-brand-taupe transition group-hover:text-brand-gold" />
                </div>
                <h3 className="mt-5 font-serif text-2xl text-brand-brown">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-brand-warm">{description}</p>
              </Link>
            ))}
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Today's focus" description="Recommended priorities to make the admin feel more like a production commerce console.">
            <div className="space-y-4 text-sm text-brand-warm">
              <div className="rounded-2xl bg-[#fcfaf5] p-4">
                <p className="font-medium text-brand-brown">Merchandising</p>
                <p className="mt-1">Keep featured products polished with media galleries, positioning, and campaign-ready metadata.</p>
              </div>
              <div className="rounded-2xl bg-[#fcfaf5] p-4">
                <p className="font-medium text-brand-brown">Order handling</p>
                <p className="mt-1">Use the operational queue to move paid orders forward and leave clean timeline notes for the team.</p>
              </div>
              <div className="rounded-2xl bg-[#fcfaf5] p-4">
                <p className="font-medium text-brand-brown">Content publishing</p>
                <p className="mt-1">Use the visual content studio to build richer stories without editing raw JSON by hand.</p>
              </div>
            </div>
          </AdminPanel>

          <AdminPanel title="System snapshot" description="Quick pulse on what the current workspace is connected to.">
            <div className="grid gap-4 text-sm text-brand-warm">
              <div className="flex items-center justify-between rounded-2xl border border-brand-sand/40 px-4 py-3">
                <span>Catalog source</span>
                <span className="font-medium text-brand-brown">{productsResult.source === "supabase" ? "Supabase live" : "Fallback data"}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-brand-sand/40 px-4 py-3">
                <span>Payments</span>
                <span className="font-medium text-brand-brown">Razorpay linked</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-brand-sand/40 px-4 py-3">
                <span>Hosting</span>
                <span className="font-medium text-brand-brown">Vercel production</span>
              </div>
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
