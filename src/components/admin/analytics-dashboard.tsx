"use client";

import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Product } from "@/types/commerce";

type RangeKey = "7d" | "30d" | "90d" | "all";

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
  quantity: number;
  lineTotalInr: number;
  createdAt: string | null;
  paymentStatus: string;
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

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function formatMonthLabel(value: string) {
  return new Date(`${value}-01`).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPresetDateRange(range: RangeKey) {
  const end = new Date();
  const start = new Date(end);
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : null;
  if (days === null) return { start: "", end: formatDateInput(end) };
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

function buildSnapshot(rawOrders: RawOrder[], rawEvents: RawEvent[], rawOrderItems: RawOrderItem[], startDate: string, endDate: string) {
  const scopedOrders = rawOrders.filter((order) => isWithinRange(order.createdAt, startDate, endDate));
  const scopedEvents = rawEvents.filter((event) => isWithinRange(event.createdAt, startDate, endDate));
  const scopedOrderItems = rawOrderItems.filter((item) => isWithinRange(item.createdAt, startDate, endDate));

  const revenueByDayMap = new Map<string, number>();
  const ordersByDayMap = new Map<string, number>();
  const paymentMap = new Map<string, number>();
  const topPagesMap = new Map<string, number>();
  const sourceMap = new Map<string, { source: string; medium: string; campaign: string; orders: number; revenueInr: number }>();
  const campaignMap = new Map<string, { campaign: string; source: string; orders: number; revenueInr: number }>();
  const productMap = new Map<string, { productId: string; productName: string; sku: string; category: string; clicks: number; addToCartIntents: number; checkoutQuantity: number; paidUnits: number; paidRevenueInr: number }>();
  const categoryMap = new Map<string, { category: string; clicks: number; addToCartIntents: number; checkoutQuantity: number; paidUnits: number; paidRevenueInr: number }>();

  const ensureProduct = (productId: string, productName: string, sku: string, category: string) => {
    const key = productId || sku || productName;
    const current = productMap.get(key) ?? { productId: productId || key, productName, sku, category, clicks: 0, addToCartIntents: 0, checkoutQuantity: 0, paidUnits: 0, paidRevenueInr: 0 };
    productMap.set(key, current);
    return current;
  };

  const ensureCategory = (category: string) => {
    const current = categoryMap.get(category) ?? { category, clicks: 0, addToCartIntents: 0, checkoutQuantity: 0, paidUnits: 0, paidRevenueInr: 0 };
    categoryMap.set(category, current);
    return current;
  };

  for (const order of scopedOrders) {
    const day = order.createdAt.slice(0, 10);
    revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + order.totalInr);
    ordersByDayMap.set(day, (ordersByDayMap.get(day) ?? 0) + 1);
    paymentMap.set(order.paymentStatus, (paymentMap.get(order.paymentStatus) ?? 0) + 1);
  }

  for (const event of scopedEvents) {
    if (event.action === "page_view" && event.path) {
      topPagesMap.set(event.path, (topPagesMap.get(event.path) ?? 0) + 1);
    }

    const metadata = event.metadata ?? {};
    const productId = typeof metadata.productId === "string" ? metadata.productId : "";
    const productName = typeof metadata.productName === "string" ? metadata.productName : "Unknown product";
    const productSlug = typeof metadata.productSlug === "string" ? metadata.productSlug : "";
    const category = typeof metadata.category === "string" ? metadata.category : "Uncategorized";

    if (event.action === "product_click") {
      ensureProduct(productId, productName, productSlug, category).clicks += 1;
      ensureCategory(category).clicks += 1;
    }

    if (event.action === "add_to_cart_intent") {
      ensureProduct(productId, productName, productSlug, category).addToCartIntents += 1;
      ensureCategory(category).addToCartIntents += 1;
    }

    if (event.action === "checkout_created") {
      const attribution = (event.payload.attribution ?? event.attribution ?? {}) as Record<string, unknown>;
      const source = typeof attribution.source === "string" && attribution.source ? attribution.source : "direct";
      const medium = typeof attribution.medium === "string" && attribution.medium ? attribution.medium : "none";
      const campaign = typeof attribution.campaign === "string" && attribution.campaign ? attribution.campaign : "unassigned";
      const revenueInr = typeof event.payload.totalInr === "number" ? event.payload.totalInr : 0;
      const items = Array.isArray(event.payload.items) ? event.payload.items : [];

      const sourceKey = `${source}::${medium}`;
      const currentSource = sourceMap.get(sourceKey) ?? { source, medium, campaign, orders: 0, revenueInr: 0 };
      currentSource.orders += 1;
      currentSource.revenueInr += revenueInr;
      sourceMap.set(sourceKey, currentSource);

      const campaignKey = `${campaign}::${source}`;
      const currentCampaign = campaignMap.get(campaignKey) ?? { campaign, source, orders: 0, revenueInr: 0 };
      currentCampaign.orders += 1;
      currentCampaign.revenueInr += revenueInr;
      campaignMap.set(campaignKey, currentCampaign);

      for (const item of items) {
        const itemProductId = typeof item?.productId === "string" ? item.productId : "";
        const quantity = typeof item?.quantity === "number" ? item.quantity : 0;
        ensureProduct(itemProductId, itemProductId || "Checkout item", itemProductId, "Uncategorized").checkoutQuantity += quantity;
        ensureCategory("Uncategorized").checkoutQuantity += quantity;
      }
    }
  }

  for (const item of scopedOrderItems) {
    if (item.paymentStatus !== "paid") continue;
    const product = ensureProduct(item.productId || item.sku || item.productName, item.productName, item.sku || "", item.category);
    product.paidUnits += item.quantity;
    product.paidRevenueInr += item.lineTotalInr;
    const category = ensureCategory(item.category);
    category.paidUnits += item.quantity;
    category.paidRevenueInr += item.lineTotalInr;
  }

  const customerOrderMap = new Map<string, RawOrder[]>();
  for (const order of scopedOrders) {
    const key = order.customerEmail.toLowerCase();
    customerOrderMap.set(key, [...(customerOrderMap.get(key) ?? []), order]);
  }

  const cohortMap = new Map<string, { cohort: string; newCustomers: number; repeatCustomers: number }>();
  for (const customerOrders of customerOrderMap.values()) {
    const sortedOrders = [...customerOrders].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    const cohort = sortedOrders[0].createdAt.slice(0, 7);
    const current = cohortMap.get(cohort) ?? { cohort, newCustomers: 0, repeatCustomers: 0 };
    current.newCustomers += 1;
    if (sortedOrders.length > 1) current.repeatCustomers += 1;
    cohortMap.set(cohort, current);
  }

  const revenueTotal = scopedOrders.reduce((sum, order) => sum + order.totalInr, 0);
  const paidOrders = scopedOrders.filter((order) => order.paymentStatus === "paid").length;
  const now = Date.now();

  return {
    revenueSeries: Array.from(revenueByDayMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({ date, label: formatDayLabel(date), revenue, orders: ordersByDayMap.get(date) ?? 0 })),
    paymentSeries: Array.from(paymentMap.entries()).map(([status, count]) => ({ status, count })),
    funnel: [
      { stage: "Checkout created", count: scopedOrders.length, rate: scopedOrders.length ? 100 : 0 },
      { stage: "Payment initiated", count: scopedOrders.filter((order) => Boolean(order.razorpayOrderId)).length, rate: scopedOrders.length ? Math.round((scopedOrders.filter((order) => Boolean(order.razorpayOrderId)).length / scopedOrders.length) * 100) : 0 },
      { stage: "Payment captured", count: paidOrders, rate: scopedOrders.length ? Math.round((paidOrders / scopedOrders.length) * 100) : 0 },
      { stage: "Fulfillment moving", count: scopedOrders.filter((order) => order.fulfillmentStatus !== "unfulfilled").length, rate: scopedOrders.length ? Math.round((scopedOrders.filter((order) => order.fulfillmentStatus !== "unfulfilled").length / scopedOrders.length) * 100) : 0 },
      { stage: "Delivered", count: scopedOrders.filter((order) => order.fulfillmentStatus === "delivered").length, rate: scopedOrders.length ? Math.round((scopedOrders.filter((order) => order.fulfillmentStatus === "delivered").length / scopedOrders.length) * 100) : 0 },
    ],
    revenueTotal,
    orderCount: scopedOrders.length,
    paidOrders,
    averageOrderValue: scopedOrders.length ? Math.round(revenueTotal / scopedOrders.length) : 0,
    trafficSummary: {
      pageViews: scopedEvents.filter((event) => event.action === "page_view").length,
      productClicks: scopedEvents.filter((event) => event.action === "product_click").length,
      addToCartIntents: scopedEvents.filter((event) => event.action === "add_to_cart_intent").length,
      checkoutSubmissions: scopedEvents.filter((event) => event.action === "checkout_submitted").length,
      abandonedCheckouts: scopedOrders.filter((order) => order.paymentStatus === "pending" && order.status === "pending" && now - new Date(order.createdAt).getTime() > 60 * 60 * 1000).length,
    },
    topPages: Array.from(topPagesMap.entries()).sort((left, right) => right[1] - left[1]).slice(0, 5).map(([path, views]) => ({ path, views })),
    sourcePerformance: Array.from(sourceMap.values()).sort((left, right) => right.orders - left.orders).slice(0, 5),
    campaignPerformance: Array.from(campaignMap.values()).sort((left, right) => right.orders - left.orders).slice(0, 5),
    cohortSeries: Array.from(cohortMap.values()).sort((left, right) => left.cohort.localeCompare(right.cohort)).slice(-6).map((cohort) => ({ ...cohort, label: formatMonthLabel(cohort.cohort), repeatRate: cohort.newCustomers ? Math.round((cohort.repeatCustomers / cohort.newCustomers) * 100) : 0 })),
    productPerformance: Array.from(productMap.values()).map((product) => ({ ...product, conversionRate: product.clicks ? Math.round((product.paidUnits / product.clicks) * 100) : 0 })).sort((left, right) => right.paidRevenueInr - left.paidRevenueInr).slice(0, 10),
    categoryPerformance: Array.from(categoryMap.values()).map((category) => ({ ...category, conversionRate: category.clicks ? Math.round((category.paidUnits / category.clicks) * 100) : 0 })).sort((left, right) => right.paidRevenueInr - left.paidRevenueInr).slice(0, 8),
  };
}

export function AnalyticsDashboard(_props: Props) {
  const initialRange = getPresetDateRange(_props.defaultRange);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [selectedPreset, setSelectedPreset] = useState<RangeKey>(_props.defaultRange);
  const snapshot = buildSnapshot(_props.rawOrders, _props.rawEvents, _props.rawOrderItems, startDate, endDate);
  const contentSeries = [
    { area: "Pages", published: _props.contentHealth.publishedPages, draft: _props.contentHealth.draftPages },
    { area: "Posts", published: _props.contentHealth.publishedPosts, draft: _props.contentHealth.draftPosts },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="font-serif text-2xl text-brand-brown">Advanced analytics</h3>
            <p className="text-sm text-brand-warm">Consent-aware traffic, exportable reports, live date filtering, and conversion analytics by SKU and category.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="brand-btn-outline px-4 py-2"
              onClick={() =>
                downloadCsv("analytics-summary.csv", [
                  { metric: "Revenue", value: snapshot.revenueTotal },
                  { metric: "Orders", value: snapshot.orderCount },
                  { metric: "Paid Orders", value: snapshot.paidOrders },
                  { metric: "Average Order Value", value: snapshot.averageOrderValue },
                  { metric: "Page Views", value: snapshot.trafficSummary.pageViews },
                  { metric: "Product Clicks", value: snapshot.trafficSummary.productClicks },
                  { metric: "Add To Cart Intents", value: snapshot.trafficSummary.addToCartIntents },
                  { metric: "Checkout Submissions", value: snapshot.trafficSummary.checkoutSubmissions },
                  { metric: "Abandoned Checkouts", value: snapshot.trafficSummary.abandonedCheckouts },
                ])
              }
            >
              <Download size={14} />
              Export summary
            </button>
            <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => downloadCsv("product-conversions.csv", snapshot.productPerformance)}>
              <FileSpreadsheet size={14} />
              Export products
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2 text-sm text-brand-warm">
              <span className="font-medium text-brand-brown">Start date</span>
              <input type="date" className="brand-input" value={startDate} onChange={(event) => { setSelectedPreset("all"); setStartDate(event.target.value); }} />
            </label>
            <label className="grid gap-2 text-sm text-brand-warm">
              <span className="font-medium text-brand-brown">End date</span>
              <input type="date" className="brand-input" value={endDate} onChange={(event) => { setSelectedPreset("all"); setEndDate(event.target.value); }} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(_props.rangeSnapshots).map((range) => (
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {[["Revenue", `Rs. ${snapshot.revenueTotal.toLocaleString("en-IN")}`], ["Orders", snapshot.orderCount], ["Paid orders", snapshot.paidOrders], ["AOV", `Rs. ${snapshot.averageOrderValue.toLocaleString("en-IN")}`]].map(([label, value]) => (
            <div key={String(label)} className="rounded-3xl border border-brand-sand/60 bg-[#fcfaf5] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-brand-brown">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
          {[["Page views", snapshot.trafficSummary.pageViews], ["Product clicks", snapshot.trafficSummary.productClicks], ["Add-to-cart intent", snapshot.trafficSummary.addToCartIntents], ["Checkout submits", snapshot.trafficSummary.checkoutSubmissions], ["Abandoned", snapshot.trafficSummary.abandonedCheckouts]].map(([label, value]) => (
            <div key={String(label)} className="rounded-3xl border border-brand-sand/60 bg-white px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-brand-brown">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <h3 className="font-serif text-2xl text-brand-brown">Revenue and order flow</h3>
            <ChartContainer config={chartConfig} className="mt-4 h-[280px] w-full">
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

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
              <h3 className="font-serif text-2xl text-brand-brown">Conversion funnel</h3>
              <div className="mt-4 space-y-3">
                {snapshot.funnel.map((step, index) => (
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
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
              <h3 className="font-serif text-2xl text-brand-brown">Payment status mix</h3>
              <ChartContainer config={chartConfig} className="mt-4 h-[260px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={snapshot.paymentSeries} dataKey="count" nameKey="status" innerRadius={55} outerRadius={88} paddingAngle={3} />
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ChartContainer>
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
              <h3 className="font-serif text-2xl text-brand-brown">Top pages</h3>
              <div className="mt-4 space-y-3">
                {snapshot.topPages.length ? snapshot.topPages.map((page) => (
                  <div key={page.path} className="flex items-center justify-between rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] px-4 py-3 text-sm">
                    <span className="truncate font-medium text-brand-brown">{page.path}</span>
                    <span className="text-brand-warm">{page.views} views</span>
                  </div>
                )) : <p className="text-sm text-brand-warm">No page view events yet.</p>}
              </div>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
              <h3 className="font-serif text-2xl text-brand-brown">Source attribution</h3>
              <div className="mt-4 space-y-3">
                {snapshot.sourcePerformance.length ? snapshot.sourcePerformance.map((source) => (
                  <div key={`${source.source}-${source.medium}`} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-brand-brown">{source.source} / {source.medium}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{source.campaign}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-brand-brown">{source.orders} orders</div>
                        <div className="text-xs text-brand-warm">Rs. {source.revenueInr.toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                  </div>
                )) : <p className="text-sm text-brand-warm">No attributed checkout events yet.</p>}
              </div>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <h3 className="font-serif text-2xl text-brand-brown">Campaign performance</h3>
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
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <h3 className="font-serif text-2xl text-brand-brown">Featured lineup</h3>
            <div className="mt-4 space-y-3">
              {_props.featuredProducts.length ? _props.featuredProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                  <div className="font-medium text-brand-brown">{product.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{product.category}</div>
                </div>
              )) : <p className="text-sm text-brand-warm">No featured products selected yet.</p>}
            </div>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <h3 className="font-serif text-2xl text-brand-brown">Recent activity</h3>
            <div className="mt-4 space-y-3">
              {_props.recentActivity.length ? _props.recentActivity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                  <div className="text-sm font-medium text-brand-brown">{item.action}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{item.entityType}</div>
                  <div className="mt-1 text-xs text-brand-taupe">{new Date(item.createdAt).toLocaleString("en-IN")}</div>
                </div>
              )) : <p className="text-sm text-brand-warm">No recent activity logged yet.</p>}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Customer cohorts</h3>
          <ChartContainer config={chartConfig} className="mt-4 h-[260px] w-full">
            <BarChart data={snapshot.cohortSeries}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="newCustomers" fill="var(--color-newCustomers)" radius={10} />
              <Bar dataKey="repeatCustomers" fill="var(--color-repeatCustomers)" radius={10} />
            </BarChart>
          </ChartContainer>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Catalog and content mix</h3>
          <div className="mt-4 space-y-6">
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={_props.categorySeries} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={10} />
              </BarChart>
            </ChartContainer>
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart data={contentSeries}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="area" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="published" fill="var(--color-published)" radius={10} />
                <Bar dataKey="draft" fill="var(--color-draft)" radius={10} />
              </BarChart>
            </ChartContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Product conversion by SKU</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-sand/40 text-left text-xs uppercase tracking-[0.16em] text-brand-taupe">
                  <th className="py-3 pr-3">Product</th>
                  <th className="py-3 pr-3">SKU</th>
                  <th className="py-3 pr-3">Clicks</th>
                  <th className="py-3 pr-3">Add To Cart</th>
                  <th className="py-3 pr-3">Paid Units</th>
                  <th className="py-3 pr-3">Conv %</th>
                  <th className="py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.productPerformance.map((product) => (
                  <tr key={`${product.productId}-${product.sku}`} className="border-b border-brand-sand/20">
                    <td className="py-3 pr-3 text-brand-brown">{product.productName}</td>
                    <td className="py-3 pr-3 text-brand-warm">{product.sku || "-"}</td>
                    <td className="py-3 pr-3">{product.clicks}</td>
                    <td className="py-3 pr-3">{product.addToCartIntents}</td>
                    <td className="py-3 pr-3">{product.paidUnits}</td>
                    <td className="py-3 pr-3">{product.conversionRate}%</td>
                    <td className="py-3 text-brand-brown">Rs. {product.paidRevenueInr.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <h3 className="font-serif text-2xl text-brand-brown">Category conversion</h3>
          <div className="mt-4 space-y-3">
            {snapshot.categoryPerformance.map((category) => (
              <div key={category.category} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-brand-brown">{category.category}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{category.clicks} clicks, {category.addToCartIntents} add-to-cart</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-brand-brown">{category.conversionRate}% conversion</div>
                    <div className="text-xs text-brand-warm">Rs. {category.paidRevenueInr.toLocaleString("en-IN")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
