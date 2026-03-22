import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getStorefrontSettings, type StorefrontSettings } from "@/lib/storefront";

type ManagedFallback = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  body: ReactNode | ((settings: StorefrontSettings) => ReactNode);
};

export async function getManagedPageMetadata(slug: string, fallback: Omit<ManagedFallback, "eyebrow" | "heroTitle" | "heroDescription" | "body">): Promise<Metadata> {
  const result = await getCatalogPageBySlug(slug);
  const page = result.data;

  if (!page) {
    return buildStorefrontMetadata({
      title: fallback.title,
      description: fallback.description,
      path: fallback.path,
      keywords: fallback.keywords,
    });
  }

  return buildStorefrontMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: fallback.path,
    keywords: page.seoKeywords,
  });
}

export async function renderManagedPage(slug: string, fallback: ManagedFallback) {
  const result = await getCatalogPageBySlug(slug);
  const page = result.data;
  const storefront = await getStorefrontSettings();
  const fallbackBody = typeof fallback.body === "function" ? fallback.body(storefront) : fallback.body;

  if (!page) {
    return (
      <div>
        <StorefrontNavbar />
        <PageHero eyebrow={fallback.eyebrow} title={fallback.heroTitle} description={fallback.heroDescription} />
        {fallbackBody}
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div>
      <StorefrontNavbar />
      <PageHero eyebrow={fallback.eyebrow} title={page.title} description={page.excerpt || fallback.heroDescription} />
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
