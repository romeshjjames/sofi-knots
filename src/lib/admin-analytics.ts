import { getCatalogProducts } from "@/lib/catalog";
import { getAuditLogs, getBlogPosts, getPages } from "@/lib/admin-data";
import { getOrders } from "@/lib/orders";

function formatDayLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export async function getAdminAnalytics() {
  const [catalogResult, orders, pages, posts, auditLogs] = await Promise.all([
    getCatalogProducts(),
    getOrders(),
    getPages(),
    getBlogPosts(),
    getAuditLogs(),
  ]);

  const products = catalogResult.data;
  const revenueByDayMap = new Map<string, number>();
  const ordersByDayMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const paymentMap = new Map<string, number>();

  for (const order of orders) {
    const day = order.createdAt.slice(0, 10);
    revenueByDayMap.set(day, (revenueByDayMap.get(day) ?? 0) + order.totalInr);
    ordersByDayMap.set(day, (ordersByDayMap.get(day) ?? 0) + 1);
    paymentMap.set(order.paymentStatus, (paymentMap.get(order.paymentStatus) ?? 0) + 1);
  }

  for (const product of products) {
    categoryMap.set(product.category, (categoryMap.get(product.category) ?? 0) + 1);
  }

  const revenueSeries = Array.from(revenueByDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, revenue]) => ({
      date,
      label: formatDayLabel(date),
      revenue,
      orders: ordersByDayMap.get(date) ?? 0,
    }));

  const categorySeries = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  const paymentSeries = Array.from(paymentMap.entries()).map(([status, count]) => ({ status, count }));

  const contentHealth = {
    publishedPages: pages.filter((page) => page.status === "published").length,
    draftPages: pages.filter((page) => page.status === "draft").length,
    publishedPosts: posts.filter((post) => post.status === "published").length,
    draftPosts: posts.filter((post) => post.status === "draft").length,
  };

  return {
    revenueSeries,
    categorySeries,
    paymentSeries,
    contentHealth,
    featuredProducts: products.filter((product) => product.isFeatured).slice(0, 6),
    recentActivity: auditLogs.slice(0, 8),
  };
}
