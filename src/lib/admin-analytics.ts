import { getCatalogProducts, getFeaturedProducts } from "@/lib/catalog";
import { getAuditLogs, getBlogPosts, getPages } from "@/lib/admin-data";
import { getOrders } from "@/lib/orders";

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatMonthLabel(value: string) {
  return new Date(`${value}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

type AnalyticsRangeKey = "7d" | "30d" | "90d" | "all";

const analyticsRanges: { key: AnalyticsRangeKey; label: string; days: number | null }[] = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
  { key: "all", label: "All time", days: null },
];

export async function getAdminAnalytics() {
  const [catalogResult, featuredResult, orders, pages, posts, auditLogs] = await Promise.all([
    getCatalogProducts(),
    getFeaturedProducts(),
    getOrders(),
    getPages(),
    getBlogPosts(),
    getAuditLogs(),
  ]);

  const products = catalogResult.data;
  const categoryMap = new Map<string, number>();

  for (const product of products) {
    categoryMap.set(product.category, (categoryMap.get(product.category) ?? 0) + 1);
  }

  const categorySeries = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  const contentHealth = {
    publishedPages: pages.filter((page) => page.status === "published").length,
    draftPages: pages.filter((page) => page.status === "draft").length,
    publishedPosts: posts.filter((post) => post.status === "published").length,
    draftPosts: posts.filter((post) => post.status === "draft").length,
  };

  const now = Date.now();
  const rangeSnapshots = Object.fromEntries(
    analyticsRanges.map(({ key, days, label }) => {
      const scopedOrders =
        days === null
          ? orders
          : orders.filter((order) => now - new Date(order.createdAt).getTime() <= days * 24 * 60 * 60 * 1000);

      const revenueByDayMap = new Map<string, number>();
      const ordersByDayMap = new Map<string, number>();
      const paymentMap = new Map<string, number>();

      for (const order of scopedOrders) {
        const day = order.createdAt.slice(0, 10);
        revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + order.totalInr);
        ordersByDayMap.set(day, (ordersByDayMap.get(day) ?? 0) + 1);
        paymentMap.set(order.paymentStatus, (paymentMap.get(order.paymentStatus) ?? 0) + 1);
      }

      const revenueSeries = Array.from(revenueByDayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(days === 7 ? -7 : days === 30 ? -10 : days === 90 ? -12 : -12)
        .map(([date, revenue]) => ({
          date,
          label: formatDayLabel(date),
          revenue,
          orders: ordersByDayMap.get(date) ?? 0,
        }));

      const paymentSeries = Array.from(paymentMap.entries()).map(([status, count]) => ({ status, count }));

      const funnel = [
        {
          stage: "Checkout created",
          count: scopedOrders.length,
          rate:
            scopedOrders.length === 0
              ? 0
              : 100,
        },
        {
          stage: "Payment initiated",
          count: scopedOrders.filter((order) => Boolean(order.razorpayOrderId)).length,
          rate:
            scopedOrders.length === 0
              ? 0
              : Math.round((scopedOrders.filter((order) => Boolean(order.razorpayOrderId)).length / scopedOrders.length) * 100),
        },
        {
          stage: "Payment captured",
          count: scopedOrders.filter((order) => order.paymentStatus === "paid").length,
          rate:
            scopedOrders.length === 0
              ? 0
              : Math.round((scopedOrders.filter((order) => order.paymentStatus === "paid").length / scopedOrders.length) * 100),
        },
        {
          stage: "Fulfillment moving",
          count: scopedOrders.filter((order) => order.fulfillmentStatus !== "unfulfilled").length,
          rate:
            scopedOrders.length === 0
              ? 0
              : Math.round((scopedOrders.filter((order) => order.fulfillmentStatus !== "unfulfilled").length / scopedOrders.length) * 100),
        },
        {
          stage: "Delivered",
          count: scopedOrders.filter((order) => order.fulfillmentStatus === "delivered").length,
          rate:
            scopedOrders.length === 0
              ? 0
              : Math.round((scopedOrders.filter((order) => order.fulfillmentStatus === "delivered").length / scopedOrders.length) * 100),
        },
      ];

      const revenueTotal = scopedOrders.reduce((sum, order) => sum + order.totalInr, 0);
      const paidOrders = scopedOrders.filter((order) => order.paymentStatus === "paid").length;
      const averageOrderValue = scopedOrders.length ? Math.round(revenueTotal / scopedOrders.length) : 0;

      return [
        key,
        {
          key,
          label,
          revenueSeries,
          paymentSeries,
          funnel,
          revenueTotal,
          orderCount: scopedOrders.length,
          paidOrders,
          averageOrderValue,
        },
      ];
    }),
  ) as Record<
    AnalyticsRangeKey,
    {
      key: AnalyticsRangeKey;
      label: string;
      revenueSeries: { date: string; label: string; revenue: number; orders: number }[];
      paymentSeries: { status: string; count: number }[];
      funnel: { stage: string; count: number; rate: number }[];
      revenueTotal: number;
      orderCount: number;
      paidOrders: number;
      averageOrderValue: number;
    }
  >;

  const customerOrderMap = new Map<string, typeof orders>();
  for (const order of orders) {
    const key = order.customerEmail.toLowerCase();
    customerOrderMap.set(key, [...(customerOrderMap.get(key) ?? []), order]);
  }

  const cohortMap = new Map<
    string,
    { cohort: string; newCustomers: number; repeatCustomers: number; revenueInr: number }
  >();

  for (const customerOrders of customerOrderMap.values()) {
    const sortedOrders = [...customerOrders].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    const firstOrder = sortedOrders[0];
    const cohort = firstOrder.createdAt.slice(0, 7);
    const current = cohortMap.get(cohort) ?? {
      cohort,
      newCustomers: 0,
      repeatCustomers: 0,
      revenueInr: 0,
    };
    current.newCustomers += 1;
    current.revenueInr += sortedOrders.reduce((sum, order) => sum + order.totalInr, 0);
    if (sortedOrders.length > 1) {
      current.repeatCustomers += 1;
    }
    cohortMap.set(cohort, current);
  }

  const cohortSeries = Array.from(cohortMap.values())
    .sort((left, right) => left.cohort.localeCompare(right.cohort))
    .slice(-6)
    .map((cohort) => ({
      cohort: cohort.cohort,
      label: formatMonthLabel(cohort.cohort),
      newCustomers: cohort.newCustomers,
      repeatCustomers: cohort.repeatCustomers,
      repeatRate: cohort.newCustomers ? Math.round((cohort.repeatCustomers / cohort.newCustomers) * 100) : 0,
      revenueInr: cohort.revenueInr,
    }));

  return {
    categorySeries,
    rangeSnapshots,
    defaultRange: "30d" as AnalyticsRangeKey,
    cohortSeries,
    contentHealth,
    featuredProducts: featuredResult.data.slice(0, 6),
    recentActivity: auditLogs.slice(0, 8),
  };
}
