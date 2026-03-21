"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Product } from "@/types/commerce";

type RangeSnapshot = {
  key: "7d" | "30d" | "90d" | "all";
  label: string;
  revenueSeries: { date: string; label: string; revenue: number; orders: number }[];
  paymentSeries: { status: string; count: number }[];
  funnel: { stage: string; count: number; rate: number }[];
  revenueTotal: number;
  orderCount: number;
  paidOrders: number;
  averageOrderValue: number;
};

type Props = {
  rangeSnapshots: Record<RangeSnapshot["key"], RangeSnapshot>;
  defaultRange: RangeSnapshot["key"];
  categorySeries: { category: string; count: number }[];
  cohortSeries: { cohort: string; label: string; newCustomers: number; repeatCustomers: number; repeatRate: number; revenueInr: number }[];
  featuredProducts: Product[];
  recentActivity: { id: string; action: string; entityType: string; createdAt: string }[];
  contentHealth: {
    publishedPages: number;
    draftPages: number;
    publishedPosts: number;
    draftPosts: number;
  };
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

export function AnalyticsDashboard({ rangeSnapshots, defaultRange, categorySeries, cohortSeries, featuredProducts, recentActivity, contentHealth }: Props) {
  const [activeRange, setActiveRange] = useState<RangeSnapshot["key"]>(defaultRange);
  const snapshot = rangeSnapshots[activeRange];
  const contentSeries = [
    { area: "Pages", published: contentHealth.publishedPages, draft: contentHealth.draftPages },
    { area: "Posts", published: contentHealth.publishedPosts, draft: contentHealth.draftPosts },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-serif text-2xl text-brand-brown">Advanced analytics</h3>
            <p className="text-sm text-brand-warm">Switch date ranges, inspect cohort retention, and track the operational conversion funnel from checkout to delivery.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(rangeSnapshots).map((range) => (
              <button
                key={range.key}
                type="button"
                onClick={() => setActiveRange(range.key)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  activeRange === range.key ? "bg-brand-brown text-white" : "border border-brand-sand/50 bg-[#fcfaf5] text-brand-warm"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <div className="rounded-3xl border border-brand-sand/60 bg-[#fcfaf5] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">Revenue</p>
            <p className="mt-2 text-3xl font-semibold text-brand-brown">Rs. {snapshot.revenueTotal.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm text-brand-warm">{snapshot.label}</p>
          </div>
          <div className="rounded-3xl border border-brand-sand/60 bg-[#fcfaf5] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">Orders</p>
            <p className="mt-2 text-3xl font-semibold text-brand-brown">{snapshot.orderCount}</p>
            <p className="mt-2 text-sm text-brand-warm">Checkout records in the selected window.</p>
          </div>
          <div className="rounded-3xl border border-brand-sand/60 bg-[#fcfaf5] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">Paid orders</p>
            <p className="mt-2 text-3xl font-semibold text-brand-brown">{snapshot.paidOrders}</p>
            <p className="mt-2 text-sm text-brand-warm">Successfully captured payments.</p>
          </div>
          <div className="rounded-3xl border border-brand-sand/60 bg-[#fcfaf5] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">AOV</p>
            <p className="mt-2 text-3xl font-semibold text-brand-brown">Rs. {snapshot.averageOrderValue.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm text-brand-warm">Average order value for the selected range.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <div className="mb-4">
              <h3 className="font-serif text-2xl text-brand-brown">Revenue and order flow</h3>
              <p className="text-sm text-brand-warm">Time-series view for sales velocity across {snapshot.label.toLowerCase()}.</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
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
              <div className="mb-4">
                <h3 className="font-serif text-2xl text-brand-brown">Conversion funnel</h3>
                <p className="text-sm text-brand-warm">Operational funnel from checkout creation through payment and delivery.</p>
              </div>
              <div className="space-y-3">
                {snapshot.funnel.map((step, index) => (
                  <div key={step.stage} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Step {index + 1}</div>
                        <div className="mt-1 font-medium text-brand-brown">{step.stage}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-brand-brown">{step.count}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">{step.rate}% of checkouts</div>
                      </div>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-cream">
                      <div className="h-full rounded-full bg-brand-gold" style={{ width: `${step.rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
              <div className="mb-4">
                <h3 className="font-serif text-2xl text-brand-brown">Payment status mix</h3>
                <p className="text-sm text-brand-warm">Payment distribution for the currently selected date range.</p>
              </div>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
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
              <div className="mb-4">
                <h3 className="font-serif text-2xl text-brand-brown">Customer cohorts</h3>
                <p className="text-sm text-brand-warm">Repeat-purchase behavior by first-order month.</p>
              </div>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={cohortSeries}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="newCustomers" fill="var(--color-newCustomers)" radius={10} />
                  <Bar dataKey="repeatCustomers" fill="var(--color-repeatCustomers)" radius={10} />
                </BarChart>
              </ChartContainer>
              <div className="mt-4 space-y-2">
                {cohortSeries.map((cohort) => (
                  <div key={cohort.cohort} className="flex items-center justify-between rounded-2xl bg-[#fcfaf5] px-4 py-3 text-sm">
                    <span className="font-medium text-brand-brown">{cohort.label}</span>
                    <span className="text-brand-warm">{cohort.repeatRate}% repeat</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
              <div className="mb-4">
                <h3 className="font-serif text-2xl text-brand-brown">Catalog and content mix</h3>
                <p className="text-sm text-brand-warm">A quick read on product category concentration and publishing balance.</p>
              </div>
              <div className="space-y-6">
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={categorySeries} layout="vertical" margin={{ left: 16 }}>
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
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <h3 className="font-serif text-2xl text-brand-brown">Featured lineup</h3>
            <div className="mt-4 space-y-3">
              {featuredProducts.length ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                    <div className="font-medium text-brand-brown">{product.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{product.category}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-warm">No featured products selected yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <h3 className="font-serif text-2xl text-brand-brown">Recent activity</h3>
            <div className="mt-4 space-y-3">
              {recentActivity.length ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-brand-sand/30 bg-[#fcfaf5] p-4">
                    <div className="text-sm font-medium text-brand-brown">{item.action}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{item.entityType}</div>
                    <div className="mt-1 text-xs text-brand-taupe">{new Date(item.createdAt).toLocaleString("en-IN")}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-warm">No recent activity logged yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
