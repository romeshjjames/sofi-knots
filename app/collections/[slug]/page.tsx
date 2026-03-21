import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { DataSourceNote } from "@/components/site/data-source-note";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { getCatalogCollectionBySlug, getCatalogPageBySlug } from "@/lib/catalog";
import { getCollectionImageSource } from "@/lib/media";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [collectionResult, pageResult] = await Promise.all([
    getCatalogCollectionBySlug(params.slug),
    getCatalogPageBySlug(`collection-${params.slug}`),
  ]);
  const collection = collectionResult.data;
  const page = pageResult.data;

  if (!collection) {
    return buildMetadata({
      title: "Collection Not Found",
      description: "The requested collection could not be found.",
      path: `/collections/${params.slug}`,
    });
  }

  return buildMetadata({
    title: page?.seoTitle || collection.seoTitle,
    description: page?.seoDescription || collection.seoDescription,
    path: `/collections/${collection.slug}`,
    keywords: page?.seoKeywords || collection.seoKeywords,
  });
}

export default async function CollectionLandingPage({ params }: { params: { slug: string } }) {
  const [collectionResult, pageResult] = await Promise.all([
    getCatalogCollectionBySlug(params.slug),
    getCatalogPageBySlug(`collection-${params.slug}`),
  ]);
  const collection = collectionResult.data;
  const page = pageResult.data;

  if (!collection) {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <DataSourceNote source={collectionResult.source} error={collectionResult.error} />
      <PageHero
        eyebrow="Collection"
        title={page?.title || collection.title}
        description={page?.excerpt || collection.description}
      />
      <section className="brand-section pt-0">
        <div className="brand-container">
          <div className="relative aspect-[16/7] overflow-hidden rounded-[28px] bg-brand-cream">
            <Image
              src={getCollectionImageSource(collection)}
              alt={collection.title}
              fill
              sizes="100vw"
              className="object-cover"
              placeholder={collection.imageUrl ? "empty" : "blur"}
            />
          </div>
        </div>
      </section>
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          {page ? (
            <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
          ) : (
            <div className="rounded-[28px] border border-brand-sand/40 bg-brand-cream p-8 text-brand-warm">
              Create a page in the admin with slug <strong>{`collection-${collection.slug}`}</strong> to add a custom collection landing page with hero content, storytelling sections, and SEO copy.
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
