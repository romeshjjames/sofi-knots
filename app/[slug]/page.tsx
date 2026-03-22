import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

async function getPageBySlug(slug: string) {
  const result = await getCatalogPageBySlug(slug);
  return result.data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    return buildStorefrontMetadata({
      title: "Page Not Found",
      description: "The requested page could not be found.",
      path: `/${params.slug}`,
    });
  }

  return buildStorefrontMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: `/${page.slug}`,
    keywords: page.seoKeywords,
  });
}

export default async function CmsPageRoute({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div>
      <StorefrontNavbar />
      <PageHero eyebrow="Sofi Knots" title={page.title} description={page.excerpt || "Explore the latest Sofi Knots content."} />
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
