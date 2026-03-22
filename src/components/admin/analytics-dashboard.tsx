"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Download, FileSpreadsheet } from "lucide-react";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Product } from "@/types/commerce";

type RangeKey = "today" | "yesterday" | "7d" | "30d" | "thisMonth" | "all";

type RawOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalInr: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  status: string;
  razorpayOrderId: string | null;
  customerEmail: string;
};

type RawEvent = {
  id: string;
  action: string;
  sessionId: string;
  createdAt: string;
  path: string | null;
  attribution: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  payload: Record<string, unknown>;
};

type RawOrderItem = {
  productId: string | null;
  productName: string;
  sku: string | null;
  category: string;
  collection: string;
  quantity: number;
  lineTotalInr: number;
  createdAt: string | null;
  paymentStatus: string;
};

type RawCustomer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  orderCount: number;
  totalSpentInr: number;
  averageOrderValueInr: number;
  tags: string[];
  joinedAt: string;
  lastOrderDate: string | null;
  notes: string;
  addressCount: number;
};

type RawDiscount = {
  id: string;
  code: string;
  title: string;
  type: string;
  value: string;
  status: string;
  usageCount: number;
  orderCount: number;
  revenueImpactInr: number;
  updatedAt: string | null;
};

type Props = {
  rangeSnapshots: Record<RangeKey, { key: RangeKey; label: string }>;
  defaultRange: RangeKey;
  categorySeries: { category: string; count: number }[];
  featuredProducts: Product[];
  recentActivity: { id: string; action: string; entityType: string; createdAt: string }[];
  contentHealth: {
    publishedPages: number;
    draftPages: number;
    publishedPosts: number;
    draftPosts: number;
  };
  rawCustomers: RawCustomer[];
  rawDiscounts: RawDiscount[];
  rawOrders: RawOrder[];
  rawEvents: RawEvent[];
  rawOrderItems: RawOrderItem[];
};

const chartConfig = {
  revenue: { label: "Revenue", color: "#c7a05a" },
  orders: { label: "Orders", color: "#7f5d3b" },
  published: { label: "Published", color: "#2e8b57" },
  draft: { label: "Draft", color: "#d99f5b" },
  count: { label: "Count", color: "#b56a5b" },
  newCustomers: { label: "New customers", color: "#c7a05a" },
  repeatCustomers: { label: "Repeat customers", color: "#2e8b57" },
} as const;

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatMonthLabel(value: string) {
  return new Date(`${value}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function getPresetDateRange(range: RangeKey) {
  const end = new Date();
  const start = new Date(end);

  if (range === "today") return { start: formatDateInput(end), end: formatDateInput(end) };

  if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    const day = formatDateInput(start);
    return { start: day, end: day };
  }

  if (range === "thisMonth") {
    start.setDate(1);
    return { start: formatDateInput(start), end: formatDateInput(end) };
  }

  if (range === "all") return { start: "", end: formatDateInput(end) };

  const days = range === "7d" ? 7 : 30;
  start.setDate(end.getDate() - (days - 1));
  return { start: formatDateInput(start), end: formatDateInput(end) };
}

function isWithinRange(value: string | null, startDate: string, endDate: string) {
  if (!value) return false;
  const date = value.slice(0, 10);
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function shiftDate(dateString: string, deltaDays: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + deltaDays);
  return formatDateInput(date);
}

function getDaySpan(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 30;
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const end = new Date(`${endDate}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function percentageDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 100);
}

function formatDelta(value: number) {
  if (value === 0) return "No change";
  return `${value > 0 ? "+" : ""}${value}% vs previous period`;
}

function buildCsv(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(","))].join("\n");
}

function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  const csv = buildCsv(rows);
  if (!csv) return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildSnapshot(
  rawOrders: RawOrder[],
  rawEvents: RawEvent[],
  rawOrderItems: RawOrderItem[],
  rawCustomers: RawCustomer[],
  rawDiscounts: RawDiscount[],
  startDate: string,
  endDate: string,
) {
  const orders = rawOrders.filter((item) => isWithinRange(item.createdAt, startDate, endDate));
  const events = rawEvents.filter((item) => isWithinRange(item.createdAt, startDate, endDate));
  const orderItems = rawOrderItems.filter((item) => isWithinRange(item.createdAt, startDate, endDate));
  const customers = rawCustomers.filter((item) => isWithinRange(item.joinedAt, startDate, endDate));
  const discounts = rawDiscounts.filter((item) => isWithinRange(item.updatedAt, startDate, endDate));

  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();
  const paymentByStatus = new Map<string, number>();
  const topPages = new Map<string, number>();
  const sources = new Map<string, { source: string; medium: string; campaign: string; orders: number; revenueInr: number }>();
  const campaigns = new Map<string, { campaign: string; source: string; orders: number; revenueInr: number }>();
  const products = new Map<string, { name: string; sku: string; category: string; clicks: number; addToCart: number; paidUnits: number; revenue: number }>();
  const collections = new Map<string, { collection: string; orders: number; units: number; revenue: number }>();
  const categories = new Map<string, { category: string; revenue: number; units: number; clicks: number }>();

  for (const order of orders) {
    const day = order.createdAt.slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + order.totalInr);
    ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
    paymentByStatus.set(order.paymentStatus, (paymentByStatus.get(order.paymentStatus) ?? 0) + 1);
  }

  for (const event of events) {
    if (event.action === "page_view" && event.path) {
      topPages.set(event.path, (topPages.get(event.path) ?? 0) + 1);
    }

    const attribution = (event.payload.attribution ?? event.attribution ?? {}) as Record<string, unknown>;
    if (event.action === "checkout_created") {
      const source = typeof attribution.source === "string" && attribution.source ? attribution.source : "direct";
      const medium = typeof attribution.medium === "string" && attribution.medium ? attribution.medium : "none";
      const campaign = typeof attribution.campaign === "string" && attribution.campaign ? attribution.campaign : "unassigned";
      const revenue = typeof event.payload.totalInr === "number" ? event.payload.totalInr : 0;
      const sourceKey = `${source}::${medium}`;
      const currentSource = sources.get(sourceKey) ?? { source, medium, campaign, orders: 0, revenueInr: 0 };
      currentSource.orders += 1;
      currentSource.revenueInr += revenue;
      sources.set(sourceKey, currentSource);

      const campaignKey = `${campaign}::${source}`;
      const currentCampaign = campaigns.get(campaignKey) ?? { campaign, source, orders: 0, revenueInr: 0 };
      currentCampaign.orders += 1;
      currentCampaign.revenueInr += revenue;
      campaigns.set(campaignKey, currentCampaign);
    }

    const metadata = event.metadata ?? {};
    const productName = typeof metadata.productName === "string" ? metadata.productName : "Unknown product";
    const sku = typeof metadata.productSlug === "string" ? metadata.productSlug : "";
    const category = typeof metadata.category === "string" ? metadata.category : "Uncategorized";
    const key = `${productName}::${sku}`;
    const currentProduct = products.get(key) ?? { name: productName, sku, category, clicks: 0, addToCart: 0, paidUnits: 0, revenue: 0 };
    if (event.action === "product_click") currentProduct.clicks += 1;
    if (event.action === "add_to_cart_intent") currentProduct.addToCart += 1;
    products.set(key, currentProduct);

    const currentCategory = categories.get(category) ?? { category, revenue: 0, units: 0, clicks: 0 };
    if (event.action === "product_click") currentCategory.clicks += 1;
    categories.set(category, currentCategory);
  }

  for (const item of orderItems) {
    if (item.paymentStatus !== "paid") continue;
    const productKey = `${item.productName}::${item.sku || ""}`;
    const product = products.get(productKey) ?? { name: item.productName, sku: item.sku || "", category: item.category, clicks: 0, addToCart: 0, paidUnits: 0, revenue: 0 };
    product.paidUnits += item.quantity;
    product.revenue += item.lineTotalInr;
    products.set(productKey, product);

    const collection = collections.get(item.collection) ?? { collection: item.collection, orders: 0, units: 0, revenue: 0 };
    collection.orders += 1;
    collection.units += item.quantity;
    collection.revenue += item.lineTotalInr;
    collections.set(item.collection, collection);

    const category = categories.get(item.category) ?? { category: item.category, revenue: 0, units: 0, clicks: 0 };
    category.revenue += item.lineTotalInr;
    category.units += item.quantity;
    categories.set(item.category, category);
  }

  const customerOrderMap = new Map<string, RawOrder[]>();
  for (const order of orders) {
    const key = order.customerEmail.toLowerCase();
    customerOrderMap.set(key, [...(customerOrderMap.get(key) ?? []), order]);
  }

  const cohorts = new Map<string, { cohort: string; newCustomers: number; repeatCustomers: number }>();
  for (const customerOrders of customerOrderMap.values()) {
    const sorted = [...customerOrders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const month = sorted[0].createdAt.slice(0, 7);
    const cohort = cohorts.get(month) ?? { cohort: month, newCustomers: 0, repeatCustomers: 0 };
    cohort.newCustomers += 1;
    if (sorted.length > 1) cohort.repeatCustomers += 1;
    cohorts.set(month, cohort);
  }

  const grossSales = orders.reduce((sum, order) => sum + order.totalInr, 0);
  const discountImpact = discounts.reduce((sum, item) => sum + item.revenueImpactInr, 0);
  const paidOrders = orders.filter((item) => item.paymentStatus === "paid").length;
  const pageViews = events.filter((item) => item.action === "page_view").length;
  const productViews = events.filter((item) => item.action === "product_click").length;
  const cartAdds = events.filter((item) => item.action === "add_to_cart_intent").length;
  const checkoutStarts = events.filter((item) => item.action === "checkout_created" || item.action === "checkout_submitted").length;

  return {
    sales: {
      grossSales,
      netSales: Math.max(grossSales - discountImpact, 0),
      discountImpact,
      shippingRevenue: Math.round(orders.length * 120 * 0.35),
      refunds: orders.filter((item) => item.paymentStatus.includes("refund")).length,
      averageOrderValue: orders.length ? Math.round(grossSales / orders.length) : 0,
    },
    orders: {
      total: orders.length,
      fulfilled: orders.filter((item) => item.fulfillmentStatus === "fulfilled" || item.fulfillmentStatus === "delivered").length,
      pending: orders.filter((item) => item.status === "pending").length,
      cancelled: orders.filter((item) => item.status === "cancelled").length,
      refunded: orders.filter((item) => item.paymentStatus.includes("refund")).length,
    },
    customers: {
      total: customers.length,
      newCustomers: customers.length,
      returningCustomers: customers.filter((item) => item.orderCount > 1).length,
      repeatRate: customers.length ? Math.round((customers.filter((item) => item.orderCount > 1).length / customers.length) * 100) : 0,
      averageSpend: customers.length ? Math.round(customers.reduce((sum, item) => sum + item.totalSpentInr, 0) / customers.length) : 0,
      topCustomers: [...customers].sort((a, b) => b.totalSpentInr - a.totalSpentInr).slice(0, 5),
    },
    discounts: {
      usageCount: discounts.reduce((sum, item) => sum + item.usageCount, 0),
      revenueImpact: discountImpact,
      mostUsed: [...discounts].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
    },
    traffic: {
      pageViews,
      productViews,
      cartAdds,
      checkoutStarts,
      purchases: paidOrders,
      conversionRate: pageViews ? Math.round((paidOrders / pageViews) * 100) : 0,
      abandoned: orders.filter((item) => item.paymentStatus === "pending" && item.status === "pending").length,
    },
    revenueSeries: Array.from(revenueByDay.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({ label: formatDayLabel(date), revenue, orders: ordersByDay.get(date) ?? 0 })),
    paymentSeries: Array.from(paymentByStatus.entries()).map(([status, count]) => ({ status, count })),
    funnels: [
      { stage: "Page views", count: pageViews, rate: 100 },
      { stage: "Product views", count: productViews, rate: pageViews ? Math.round((productViews / pageViews) * 100) : 0 },
      { stage: "Cart additions", count: cartAdds, rate: productViews ? Math.round((cartAdds / productViews) * 100) : 0 },
      { stage: "Checkout starts", count: checkoutStarts, rate: cartAdds ? Math.round((checkoutStarts / cartAdds) * 100) : 0 },
      { stage: "Purchases", count: paidOrders, rate: checkoutStarts ? Math.round((paidOrders / checkoutStarts) * 100) : 0 },
    ],
    productPerformance: Array.from(products.values()).map((item) => ({ ...item, conversionRate: item.clicks ? Math.round((item.paidUnits / item.clicks) * 100) : 0 })).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    leastSellingProducts: Array.from(products.values()).filter((item) => item.paidUnits > 0).sort((a, b) => a.revenue - b.revenue).slice(0, 5),
    collectionPerformance: Array.from(collections.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    categoryPerformance: Array.from(categories.values()).map((item) => ({ ...item, conversionRate: item.clicks ? Math.round((item.units / item.clicks) * 100) : 0 })).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    topPages: Array.from(topPages.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, views]) => ({ path, views })),
    sourcePerformance: Array.from(sources.values()).sort((a, b) => b.orders - a.orders).slice(0, 5),
    campaignPerformance: Array.from(campaigns.values()).sort((a, b) => b.orders - a.orders).slice(0, 5),
    cohortSeries: Array.from(cohorts.values()).sort((a, b) => a.cohort.localeCompare(b.cohort)).slice(-6).map((item) => ({ ...item, label: formatMonthLabel(item.cohort) })),
    recentSales: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6),
  };
}

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-3xl border border-brand-sand/60 bg-[#fcfaf5] px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-brand-taupe">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-brand-brown">{value}</p>
      <p className="mt-2 text-sm text-brand-warm">{hint}</p>
    </div>
  );
}

export function AnalyticsDashboard(props: Props) {
  const initialRange = getPresetDateRange(props.defaultRange);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [selectedPreset, setSelectedPreset] = useState<RangeKey>(props.defaultRange);

  const snapshot = useMemo(
    () => buildSnapshot(props.rawOrders, props.rawEvents, props.rawOrderItems, props.rawCustomers, props.rawDiscounts, startDate, endDate),
    [props.rawOrders, props.rawEvents, props.rawOrderItems, props.rawCustomers, props.rawDiscounts, startDate, endDate],
  );

  const previousSnapshot = useMemo(() => {
    if (!startDate || !endDate) return buildSnapshot(props.rawOrders, props.rawEvents, props.rawOrderItems, props.rawCustomers, props.rawDiscounts, "", "");
    const span = getDaySpan(startDate, endDate);
    const prevEnd = shiftDate(startDate, -1);
    const prevStart = shiftDate(prevEnd, -(span - 1));
    return buildSnapshot(props.rawOrders, props.rawEvents, props.rawOrderItems, props.rawCustomers, props.rawDiscounts, prevStart, prevEnd);
  }, [props.rawOrders, props.rawEvents, props.rawOrderItems, props.rawCustomers, props.rawDiscounts, startDate, endDate]);

  const contentSeries = [
    { area: "Pages", published: props.contentHealth.publishedPages, draft: props.contentHealth.draftPages },
    { area: "Posts", published: props.contentHealth.publishedPosts, draft: props.contentHealth.draftPosts },
  ];

  const summaryExport = [
    { metric: "Gross sales", value: snapshot.sales.grossSales },
    { metric: "Net sales", value: snapshot.sales.netSales },
    { metric: "Total orders", value: snapshot.orders.total },
    { metric: "Customers", value: snapshot.customers.total },
    { metric: "Conversion", value: `${snapshot.traffic.conversionRate}%` },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="font-serif text-2xl text-brand-brown">Analytics command center</h3>
            <p className="text-sm text-brand-warm">Revenue, orders, products, collections, customers, discounts, traffic, exports, and recent sales in one clean workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => downloadCsv("analytics-summary.csv", summaryExport)}>
              <Download size={14} />
              Export summary
            </button>
            <button
              type="button"
              className="brand-btn-outline px-4 py-2"
              onClick={() =>
                downloadCsv(
                  "analytics-products.csv",
                  snapshot.productPerformance.map((item) => ({
                    product: item.name,
                    sku: item.sku,
                    revenue: item.revenue,
                    paidUnits: item.paidUnits,
                    conversionRate: item.conversionRate,
                  })),
                )
              }
            >
              <FileSpreadsheet size={14} />
              Export products
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_auto]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2 text-sm text-brand-warm">
              <span className="font-medium text-brand-brown">Start date</span>
              <input type="date" className="brand-input" value={startDate} onChange={(event) => { setSelectedPreset("all"); setStartDate(event.target.value); }} />
            </label>
            <label className="grid gap-2 text-sm text-brand-warm">
              <span className="font-medium text-brand-brown">End date</span>
              <input type="date" className="brand-input" value={endDate} onChange={(event) => { setSelectedPreset("all"); setEndDate(event.target.value); }} />
            </label>
            <div className="rounded-3xl border border-brand-sand/50 bg-[#fcfaf5] px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-taupe">Compare</p>
              <p className="mt-2 text-lg font-semibold text-brand-brown">{formatDelta(percentageDelta(snapshot.sales.grossSales, previousSnapshot.sales.grossSales))}</p>
              <p className="mt-1 text-sm text-brand-warm">Against the previous matching period.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(props.rangeSnapshots).map((range) => (
              <button
                key={range.key}
                type="button"
                onClick={() => {
                  const preset = getPresetDateRange(range.key);
                  setSelectedPreset(range.key);
                  setStartDate(preset.start);
                  setEndDate(preset.end);
                }}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${selectedPreset === range.key ? "bg-brand-brown text-white" : "border border-brand-sand/50 bg-[#fcfaf5] text-brand-warm"}`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard label="Total sales" value={`Rs. ${snapshot.sales.grossSales.toLocaleString("en-IN")}`} hint={formatDelta(percentageDelta(snapshot.sales.grossSales, previousSnapshot.sales.grossSales))} />
        <MetricCard label="Total orders" value={snapshot.orders.total} hint={formatDelta(percentageDelta(snapshot.orders.total, previousSnapshot.orders.total))} />
        <MetricCard label="Total customers" value={snapshot.customers.total} hint={`${snapshot.customers.returningCustomers} returning`} />
        <MetricCard label="Products sold" value={snapshot.productPerformance.reduce((sum, item) => sum + item.paidUnits, 0)} hint="Paid units in range." />
        <MetricCard label="AOV" value={`Rs. ${snapshot.sales.averageOrderValue.toLocaleString("en-IN")}`} hint="Average order value." />
        <MetricCard label="Conversion" value={`${snapshot.traffic.conversionRate}%`} hint="Purchases vs visits." />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Sales analytics</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Gross sales" value={`Rs. ${snapshot.sales.grossSales.toLocaleString("en-IN")}`} hint="Tracked order revenue." />
            <MetricCard label="Net sales" value={`Rs. ${snapshot.sales.netSales.toLocaleString("en-IN")}`} hint="After discount impact." />
            <MetricCard label="Discounts" value={`Rs. ${snapshot.sales.discountImpact.toLocaleString("en-IN")}`} hint="Discount-driven revenue impact." />
            <MetricCard label="Refunds" value={snapshot.sales.refunds} hint="Refunded order count." />
            <MetricCard label="Shipping" value={`Rs. ${snapshot.sales.shippingRevenue.toLocaleString("en-IN")}`} hint="Estimated shipping revenue." />
            <MetricCard label="AOV" value={`Rs. ${snapshot.sales.averageOrderValue.toLocaleString("en-IN")}`} hint="Average order size." />
          </div>
          <ChartContainer config={chartConfig} className="mt-6 h-[280px] w-full">
            <BarChart data={snapshot.revenueSeries}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={10} />
              <Bar dataKey="orders" fill="var(--color-orders)" radius={10} />
            </BarChart>
          </ChartContainer>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Recent sales activity</h3>
          <div className="mt-4 space-y-3">
            {snapshot.recentSales.length ? snapshot.recentSales.map((order) => (
              <div key={order.id} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-brand-brown">{order.orderNumber}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{order.customerEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-brand-brown">Rs. {order.totalInr.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-brand-warm">{new Date(order.createdAt).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-brand-warm">No recent sales in this period.</p>}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Order analytics</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Total" value={snapshot.orders.total} hint="All orders." />
            <MetricCard label="Fulfilled" value={snapshot.orders.fulfilled} hint="Shipped or delivered." />
            <MetricCard label="Pending" value={snapshot.orders.pending} hint="Awaiting action." />
            <MetricCard label="Cancelled" value={snapshot.orders.cancelled} hint="Stopped orders." />
            <MetricCard label="Refunded" value={snapshot.orders.refunded} hint="Refunded payments." />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {snapshot.funnels.map((step, index) => (
                <div key={step.stage} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Step {index + 1}</div>
                      <div className="mt-1 font-medium text-brand-brown">{step.stage}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-brand-brown">{step.count}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">{step.rate}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={snapshot.paymentSeries} dataKey="count" nameKey="status" innerRadius={55} outerRadius={88} paddingAngle={3} />
                <ChartLegend content={<ChartLegendContent nameKey="status" />} />
              </PieChart>
            </ChartContainer>
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Traffic and conversion</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Visits" value={snapshot.traffic.pageViews} hint="Tracked page views." />
            <MetricCard label="Product views" value={snapshot.traffic.productViews} hint="Product click events." />
            <MetricCard label="Cart adds" value={snapshot.traffic.cartAdds} hint="Add-to-cart intent." />
            <MetricCard label="Checkout starts" value={snapshot.traffic.checkoutStarts} hint="Checkout submitted/created." />
            <MetricCard label="Purchases" value={snapshot.traffic.purchases} hint="Paid orders." />
            <MetricCard label="Abandoned" value={snapshot.traffic.abandoned} hint="Pending unfinished orders." />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {snapshot.topPages.length ? snapshot.topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] px-4 py-3 text-sm">
                  <span className="truncate font-medium text-brand-brown">{page.path}</span>
                  <span className="text-brand-warm">{page.views} views</span>
                </div>
              )) : <p className="text-sm text-brand-warm">No page view events yet.</p>}
            </div>
            <div className="space-y-3">
              {snapshot.sourcePerformance.length ? snapshot.sourcePerformance.map((source) => (
                <div key={`${source.source}-${source.medium}`} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                  <div className="font-medium text-brand-brown">{source.source} / {source.medium}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{source.campaign}</div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-brand-warm">{source.orders} orders</span>
                    <span className="font-medium text-brand-brown">Rs. {source.revenueInr.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-brand-warm">No attribution data yet.</p>}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Product performance</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-sand/40 text-left text-xs uppercase tracking-[0.16em] text-brand-taupe">
                  <th className="py-3 pr-3">Product</th>
                  <th className="py-3 pr-3">SKU</th>
                  <th className="py-3 pr-3">Units</th>
                  <th className="py-3 pr-3">Revenue</th>
                  <th className="py-3 pr-3">Views</th>
                  <th className="py-3">Conv %</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.productPerformance.map((product) => (
                  <tr key={`${product.name}-${product.sku}`} className="border-b border-brand-sand/20">
                    <td className="py-3 pr-3 text-brand-brown">{product.name}</td>
                    <td className="py-3 pr-3 text-brand-warm">{product.sku || "-"}</td>
                    <td className="py-3 pr-3">{product.paidUnits}</td>
                    <td className="py-3 pr-3 text-brand-brown">Rs. {product.revenue.toLocaleString("en-IN")}</td>
                    <td className="py-3 pr-3">{product.clicks}</td>
                    <td className="py-3">{product.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Least-selling products</p>
            <div className="mt-3 space-y-2">
              {snapshot.leastSellingProducts.length ? snapshot.leastSellingProducts.map((product) => (
                <div key={`least-${product.name}`} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-brown">{product.name}</span>
                  <span className="text-brand-warm">Rs. {product.revenue.toLocaleString("en-IN")}</span>
                </div>
              )) : <p className="text-sm text-brand-warm">No product sales recorded yet.</p>}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Collections and categories</h3>
          <div className="mt-4 space-y-3">
            {snapshot.collectionPerformance.length ? snapshot.collectionPerformance.map((collection) => (
              <div key={collection.collection} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-brand-brown">{collection.collection}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{collection.orders} order lines</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-brand-brown">Rs. {collection.revenue.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-brand-warm">{collection.units} units</div>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-brand-warm">No collection sales data yet.</p>}
          </div>
          <ChartContainer config={chartConfig} className="mt-6 h-[220px] w-full">
            <BarChart data={props.categorySeries} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="category" hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={10} />
            </BarChart>
          </ChartContainer>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Customer and discount analytics</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="New customers" value={snapshot.customers.newCustomers} hint="Joined in selected range." />
            <MetricCard label="Returning" value={snapshot.customers.returningCustomers} hint="Placed more than one order." />
            <MetricCard label="Repeat rate" value={`${snapshot.customers.repeatRate}%`} hint="Returning share." />
            <MetricCard label="Avg spend" value={`Rs. ${snapshot.customers.averageSpend.toLocaleString("en-IN")}`} hint="Average customer spend." />
          </div>
          <ChartContainer config={chartConfig} className="mt-6 h-[240px] w-full">
            <BarChart data={snapshot.cohortSeries}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="newCustomers" fill="var(--color-newCustomers)" radius={10} />
              <Bar dataKey="repeatCustomers" fill="var(--color-repeatCustomers)" radius={10} />
            </BarChart>
          </ChartContainer>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Top customers</p>
              <div className="mt-3 space-y-2">
                {snapshot.customers.topCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-brown">{customer.fullName}</span>
                    <span className="text-brand-warm">Rs. {customer.totalSpentInr.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Most-used discounts</p>
              <div className="mt-3 space-y-2">
                {snapshot.discounts.mostUsed.length ? snapshot.discounts.mostUsed.map((discount) => (
                  <div key={discount.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-brown">{discount.code}</span>
                    <span className="text-brand-warm">{discount.usageCount} uses</span>
                  </div>
                )) : <p className="text-sm text-brand-warm">No discount activity in range.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Campaign and content insights</h3>
          <div className="mt-4 space-y-3">
            {snapshot.campaignPerformance.length ? snapshot.campaignPerformance.map((campaign) => (
              <div key={`${campaign.campaign}-${campaign.source}`} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                <div className="font-medium text-brand-brown">{campaign.campaign}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{campaign.source}</div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-brand-warm">{campaign.orders} orders</span>
                  <span className="font-medium text-brand-brown">Rs. {campaign.revenueInr.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )) : <p className="text-sm text-brand-warm">No UTM campaign data yet.</p>}
          </div>
          <ChartContainer config={chartConfig} className="mt-6 h-[220px] w-full">
            <BarChart data={contentSeries}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="area" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="published" fill="var(--color-published)" radius={10} />
              <Bar dataKey="draft" fill="var(--color-draft)" radius={10} />
            </BarChart>
          </ChartContainer>
          <div className="mt-4 rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Recent activity</p>
            <div className="mt-3 space-y-2">
              {props.recentActivity.length ? props.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-brown">{item.action}</span>
                  <span className="text-brand-warm">{new Date(item.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              )) : <p className="text-sm text-brand-warm">No recent activity logged yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
