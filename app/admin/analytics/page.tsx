import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminAnalyticsPage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const analytics = await getAdminAnalytics();

  return (
    <AdminShell
      active="analytics"
      eyebrow="Performance intelligence"
      title="Analytics"
      description="Revenue, traffic, attribution, cohorts, and funnel performance across the storefront in one premium reporting workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Analytics" },
      ]}
    >
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
    </AdminShell>
  );
}
