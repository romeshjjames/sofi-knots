"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Product } from "@/types/commerce";

type Props = {
  revenueSeries: { label: string; revenue: number; orders: number }[];
  categorySeries: { category: string; count: number }[];
  paymentSeries: { status: string; count: number }[];
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
} as const;

export function AnalyticsDashboard({ revenueSeries, categorySeries, paymentSeries, featuredProducts, recentActivity, contentHealth }: Props) {
  const contentSeries = [
    { area: "Pages", published: contentHealth.publishedPages, draft: contentHealth.draftPages },
    { area: "Posts", published: contentHealth.publishedPosts, draft: contentHealth.draftPosts },
  ];

  return (
    <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <div className="mb-4">
            <h3 className="font-serif text-2xl text-brand-brown">Revenue and order flow</h3>
            <p className="text-sm text-brand-warm">Seven-day operating picture for sales velocity and order volume.</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={revenueSeries}>
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
              <h3 className="font-serif text-2xl text-brand-brown">Catalog mix</h3>
              <p className="text-sm text-brand-warm">Top categories by product count right now.</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={categorySeries} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={10} />
              </BarChart>
            </ChartContainer>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
            <div className="mb-4">
              <h3 className="font-serif text-2xl text-brand-brown">Content publishing health</h3>
              <p className="text-sm text-brand-warm">Published versus draft content across key CMS types.</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={contentSeries}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="area" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="published" fill="var(--color-published)" radius={10} />
                <Bar dataKey="draft" fill="var(--color-draft)" radius={10} />
              </BarChart>
            </ChartContainer>
          </section>
        </div>
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
          <div className="mb-4">
            <h3 className="font-serif text-2xl text-brand-brown">Payment status mix</h3>
            <p className="text-sm text-brand-warm">Payment distribution across the visible order set.</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={paymentSeries} dataKey="count" nameKey="status" innerRadius={55} outerRadius={88} paddingAngle={3} />
              <ChartLegend content={<ChartLegendContent nameKey="status" />} />
            </PieChart>
          </ChartContainer>
        </section>

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
  );
}
