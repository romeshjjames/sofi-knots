import type { MetadataRoute } from "next";
import { getStorefrontSettings } from "@/lib/storefront";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const storefront = await getStorefrontSettings();

  return {
    rules: storefront.seo.allowIndexing
      ? {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/api"],
        }
      : {
          userAgent: "*",
          disallow: ["/"],
        },
    sitemap: `${storefront.siteUrl}/sitemap.xml`,
  };
}
