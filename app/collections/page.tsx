import type { Metadata } from "next";
import Link from "next/link";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { DataSourceNote } from "@/components/site/data-source-note";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogCollections, getCatalogPageBySlug } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getCatalogPageBySlug("collections");
  const page = result.data;

  return buildStorefrontMetadata({
    title: page?.seoTitle || "Macrame Collections",
    description: page?.seoDescription || "Explore Sofi Knots collections curated around bohemian living, earthy styling, gifting, and handmade keepsakes.",
    path: "/collections",
    keywords: page?.seoKeywords || ["macrame collections", "boho decor collections", "artisan handmade gifts"],
  });
}

export default async function CollectionsPage() {
  const [result, pageResult] = await Promise.all([getCatalogCollections(), getCatalogPageBySlug("collections")]);
  const collectionsPage = pageResult.data;

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={result.source} error={result.error} />
      <PageHero
        eyebrow="Curated"
        title={collectionsPage?.title || "Collections Designed Around Stories"}
        description={collectionsPage?.excerpt || "Collections let the admin team group products for campaigns, gifting themes, and on-page SEO landing pages."}
      />
      {collectionsPage ? (
        <section className="brand-section pb-0">
          <div className="brand-container max-w-5xl">
            <CmsPageRenderer bodyText={JSON.stringify(collectionsPage.body ?? [], null, 2)} />
          </div>
        </section>
      ) : null}
      <section className="brand-section">
        <div className="brand-container grid grid-cols-1 gap-6 md:grid-cols-3">
          {result.data.map((collection) => (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="overflow-hidden rounded-sm bg-brand-cream transition hover:-translate-y-1">
              <div className="relative aspect-[3/4]">
                {collection.imageUrl ? (
                  <img
                    src={collection.imageUrl}
                    alt={collection.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#efe3d2_0%,#dcc6ad_100%)] p-6 text-center">
                    <div>
                      <p className="brand-label mb-3">Media needed</p>
                      <p className="font-serif text-2xl text-brand-brown">{collection.title}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <p className="brand-label mb-2">SEO Landing Collection</p>
                <h2 className="mb-3 font-serif text-3xl text-brand-brown">{collection.title}</h2>
                <p className="text-sm leading-relaxed text-brand-warm">{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
