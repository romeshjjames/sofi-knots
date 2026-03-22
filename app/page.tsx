import type { Metadata } from "next";
import { HomePage } from "@/features/storefront/home-page";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getStorefrontSettings } from "@/lib/storefront";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const [homePageResult, storefront] = await Promise.all([getCatalogPageBySlug("home"), getStorefrontSettings()]);
  const homePage = homePageResult.data;

  return buildStorefrontMetadata({
    title: homePage?.seoTitle || storefront.seo.defaultTitle,
    description: homePage?.seoDescription || storefront.seo.defaultDescription,
    path: "/",
    keywords: homePage?.seoKeywords || storefront.defaultKeywords,
  });
}

export default function Page() {
  return <HomePage />;
}
