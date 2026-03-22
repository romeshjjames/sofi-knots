import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCatalogProducts, getFeaturedProducts } from "@/lib/catalog";
import { getAuditLogs, getBlogPosts, getPages } from "@/lib/admin-data";
import { getCustomers } from "@/lib/customers";
import { getDiscounts } from "@/lib/discounts";
import { getOrders } from "@/lib/orders";

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatMonthLabel(value: string) {
  return new Date(`${value}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

type AnalyticsRangeKey = "today" | "yesterday" | "7d" | "30d" | "thisMonth" | "all";

type AnalyticsEventRow = {
  id: string;
  action: string;
  entity_id: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

type OrderItemAnalyticsRow = {
  product_id: string | null;
  product_name: string;
  sku: string | null;
  quantity: number;
  line_total_inr: number;
  orders: {
    created_at: string;
    payment_status: string;
  }[] | null;
};

const analyticsRanges: { key: AnalyticsRangeKey; label: string; days: number | null }[] = [
  { key: "today", label: "Today", days: 1 },
  { key: "yesterday", label: "Yesterday", days: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "thisMonth", label: "This month", days: null },
  { key: "all", label: "All time", days: null },
];

export async function getAdminAnalytics() {
  const supabase = createAdminSupabaseClient();
  const [catalogResult, featuredResult, orders, pages, posts, auditLogs, customers, discounts, analyticsEventsResult, orderItemsResult] = await Promise.all([
    getCatalogProducts(),
    getFeaturedProducts(),
    getOrders(),
    getPages(),
    getBlogPosts(),
    getAuditLogs(),
    getCustomers(),
    getDiscounts(),
    supabase
      .from("audit_logs")
      .select("id, action, entity_id, payload, created_at")
      .eq("entity_type", "analytics_event")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("order_items")
      .select("product_id, product_name, sku, quantity, line_total_inr, orders(created_at, payment_status)")
      .limit(2000),
  ]);
  const analyticsEvents = (analyticsEventsResult.data ?? []) as AnalyticsEventRow[];
  const orderItems = (orderItemsResult.data ?? []) as OrderItemAnalyticsRow[];

  const products = catalogResult.data;
  const categoryMap = new Map<string, number>();
  const productLookup = new Map(products.map((product) => [product.id, product]));

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
        key === "thisMonth"
          ? orders.filter((order) => order.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7))
          : key === "yesterday"
            ? orders.filter((order) => {
                const target = new Date();
                target.setDate(target.getDate() - 1);
                return order.createdAt.slice(0, 10) === target.toISOString().slice(0, 10);
              })
            : days === null
          ? orders
          : orders.filter((order) => now - new Date(order.createdAt).getTime() <= days * 24 * 60 * 60 * 1000);
      const scopedEvents =
        key === "thisMonth"
          ? analyticsEvents.filter((event) => event.created_at.slice(0, 7) === new Date().toISOString().slice(0, 7))
          : key === "yesterday"
            ? analyticsEvents.filter((event) => {
                const target = new Date();
                target.setDate(target.getDate() - 1);
                return event.created_at.slice(0, 10) === target.toISOString().slice(0, 10);
              })
            : days === null
          ? analyticsEvents
          : analyticsEvents.filter((event) => now - new Date(event.created_at).getTime() <= days * 24 * 60 * 60 * 1000);

      const revenueByDayMap = new Map<string, number>();
      const ordersByDayMap = new Map<string, number>();
      const paymentMap = new Map<string, number>();
      const topPagesMap = new Map<string, number>();
      const sourceMap = new Map<string, { source: string; medium: string; campaign: string; orders: number; revenueInr: number }>();
      const campaignMap = new Map<string, { campaign: string; source: string; orders: number; revenueInr: number }>();

      for (const order of scopedOrders) {
        const day = order.createdAt.slice(0, 10);
        revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + order.totalInr);
        ordersByDayMap.set(day, (ordersByDayMap.get(day) ?? 0) + 1);
        paymentMap.set(order.paymentStatus, (paymentMap.get(order.paymentStatus) ?? 0) + 1);
      }

      for (const event of scopedEvents) {
        const payload = (event.payload ?? {}) as Record<string, unknown>;
        const path = typeof payload.path === "string" ? payload.path : null;
        const attribution = (payload.attribution ?? {}) as Record<string, unknown>;
        const metadata = (payload.metadata ?? {}) as Record<string, unknown>;

        if (event.action === "page_view" && path) {
          topPagesMap.set(path, (topPagesMap.get(path) ?? 0) + 1);
        }

        if (event.action === "checkout_created") {
          const source = typeof attribution.source === "string" && attribution.source ? attribution.source : "direct";
          const medium = typeof attribution.medium === "string" && attribution.medium ? attribution.medium : "none";
          const campaign = typeof attribution.campaign === "string" && attribution.campaign ? attribution.campaign : "unassigned";
          const revenueInr = typeof payload.totalInr === "number" ? payload.totalInr : 0;

          const sourceKey = `${source}::${medium}`;
          const currentSource = sourceMap.get(sourceKey) ?? {
            source,
            medium,
            campaign,
            orders: 0,
            revenueInr: 0,
          };
          currentSource.orders += 1;
          currentSource.revenueInr += revenueInr;
          sourceMap.set(sourceKey, currentSource);

          const campaignKey = `${campaign}::${source}`;
          const currentCampaign = campaignMap.get(campaignKey) ?? {
            campaign,
            source,
            orders: 0,
            revenueInr: 0,
          };
          currentCampaign.orders += 1;
          currentCampaign.revenueInr += revenueInr;
          campaignMap.set(campaignKey, currentCampaign);
        }

        void metadata;
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
      const abandonedCheckouts = scopedOrders.filter(
        (order) =>
          order.paymentStatus === "pending" &&
          order.status === "pending" &&
          now - new Date(order.createdAt).getTime() > 60 * 60 * 1000,
      ).length;
      const pageViews = scopedEvents.filter((event) => event.action === "page_view").length;
      const productClicks = scopedEvents.filter((event) => event.action === "product_click").length;
      const addToCartIntents = scopedEvents.filter((event) => event.action === "add_to_cart_intent").length;
      const checkoutSubmissions = scopedEvents.filter((event) => event.action === "checkout_submitted").length;
      const topPages = Array.from(topPagesMap.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([path, views]) => ({ path, views }));
      const sourcePerformance = Array.from(sourceMap.values())
        .sort((left, right) => right.orders - left.orders)
        .slice(0, 5);
      const campaignPerformance = Array.from(campaignMap.values())
        .sort((left, right) => right.orders - left.orders)
        .slice(0, 5);

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
          trafficSummary: {
            pageViews,
            productClicks,
            addToCartIntents,
            checkoutSubmissions,
            abandonedCheckouts,
          },
          topPages,
          sourcePerformance,
          campaignPerformance,
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
      trafficSummary: {
        pageViews: number;
        productClicks: number;
        addToCartIntents: number;
        checkoutSubmissions: number;
        abandonedCheckouts: number;
      };
      topPages: { path: string; views: number }[];
      sourcePerformance: { source: string; medium: string; campaign: string; orders: number; revenueInr: number }[];
      campaignPerformance: { campaign: string; source: string; orders: number; revenueInr: number }[];
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

  const rawOrders = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    totalInr: order.totalInr,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    status: order.status,
    razorpayOrderId: order.razorpayOrderId ?? null,
    customerEmail: order.customerEmail,
  }));

  const rawEvents = analyticsEvents.map((event) => ({
    id: event.id,
    action: event.action,
    sessionId: event.entity_id,
    createdAt: event.created_at,
    path: typeof event.payload?.path === "string" ? event.payload.path : null,
    attribution: ((event.payload?.attribution ?? null) as Record<string, unknown> | null),
    metadata: ((event.payload?.metadata ?? {}) as Record<string, unknown>),
    payload: (event.payload ?? {}) as Record<string, unknown>,
  }));

  const rawOrderItems = orderItems.map((item) => {
    const product = item.product_id ? productLookup.get(item.product_id) : undefined;
    const order = item.orders?.[0];
    return {
      productId: item.product_id,
      productName: item.product_name,
      sku: item.sku,
      category: product?.category ?? "Uncategorized",
      collection: product?.collection ?? "Unassigned",
      quantity: item.quantity,
      lineTotalInr: item.line_total_inr,
      createdAt: order?.created_at ?? null,
      paymentStatus: order?.payment_status ?? "pending",
    };
  });

  return {
    categorySeries,
    rangeSnapshots,
    defaultRange: "30d" as AnalyticsRangeKey,
    cohortSeries,
    contentHealth,
    featuredProducts: featuredResult.data.slice(0, 6),
    recentActivity: auditLogs.slice(0, 8),
    rawCustomers: customers,
    rawDiscounts: discounts,
    rawOrders,
    rawEvents,
    rawOrderItems,
  };
}
