import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

type ManagedFallback = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  body: ReactNode;
};

export async function getManagedPageMetadata(slug: string, fallback: Omit<ManagedFallback, "eyebrow" | "heroTitle" | "heroDescription" | "body">): Promise<Metadata> {
  const result = await getCatalogPageBySlug(slug);
  const page = result.data;

  if (!page) {
    return buildMetadata({
      title: fallback.title,
      description: fallback.description,
      path: fallback.path,
      keywords: fallback.keywords,
    });
  }

  return buildMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: fallback.path,
    keywords: page.seoKeywords,
  });
}

export async function renderManagedPage(slug: string, fallback: ManagedFallback) {
  const result = await getCatalogPageBySlug(slug);
  const page = result.data;

  if (!page) {
    return (
      <div>
        <Navbar />
        <PageHero eyebrow={fallback.eyebrow} title={fallback.heroTitle} description={fallback.heroDescription} />
        {fallback.body}
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <PageHero eyebrow={fallback.eyebrow} title={page.title} description={page.excerpt || fallback.heroDescription} />
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
