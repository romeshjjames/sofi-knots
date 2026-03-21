import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

async function getPageBySlug(slug: string) {
  const result = await getCatalogPageBySlug(slug);
  return result.data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);

  if (!page) {
    return buildMetadata({
      title: "Page Not Found",
      description: "The requested page could not be found.",
      path: `/${params.slug}`,
    });
  }

  return buildMetadata({
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
      <Navbar />
      <PageHero eyebrow="Sofi Knots" title={page.title} description={page.excerpt || "Explore the latest Sofi Knots content."} />
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
