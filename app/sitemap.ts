import type { MetadataRoute } from "next";
import { getCatalogBlogPosts, getCatalogCollections, getCatalogProducts } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";
import { getStorefrontSettings } from "@/lib/storefront";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const storefront = await getStorefrontSettings();
  const [productsResult, blogPostsResult, collectionsResult] = await Promise.all([
    getCatalogProducts(),
    getCatalogBlogPosts(),
    getCatalogCollections(),
  ]);
  const supabase = createAdminSupabaseClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("slug, updated_at")
    .eq("status", "published")
    .neq("slug", "home");
  const staticRoutes = ["", "/shop", "/collections", "/about", "/contact", "/blog", "/faq", "/privacy", "/terms", "/shipping"];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route || "/", storefront.siteUrl),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...(pages ?? []).map((page) => ({
      url: absoluteUrl(`/${page.slug}`, storefront.siteUrl),
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...collectionsResult.data.map((collection) => ({
      url: absoluteUrl(`/collections/${collection.slug}`, storefront.siteUrl),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...productsResult.data.map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`, storefront.siteUrl),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogPostsResult.data.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`, storefront.siteUrl),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
