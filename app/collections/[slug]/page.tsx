import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { DataSourceNote } from "@/components/site/data-source-note";
import { PageHero } from "@/components/site/page-hero";
import { ProductCard } from "@/components/site/product-card";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCollectionAdminSettingsBySlug, getCollectionAdminSettingsMap, getCollectionPageContentMap } from "@/lib/admin-data";
import { getCatalogCollectionBySlug, getCatalogPageBySlug, getCatalogProducts, resolveCollectionProducts } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [collectionResult, pageResult] = await Promise.all([
    getCatalogCollectionBySlug(params.slug),
    getCatalogPageBySlug(`collection-${params.slug}`),
  ]);
  const collection = collectionResult.data;
  const page = pageResult.data;

  if (!collection) {
    return buildStorefrontMetadata({
      title: "Collection Not Found",
      description: "The requested collection could not be found.",
      path: `/collections/${params.slug}`,
    });
  }

  return buildStorefrontMetadata({
    title: page?.seoTitle || collection.seoTitle,
    description: page?.seoDescription || collection.seoDescription,
    path: `/collections/${collection.slug}`,
    keywords: page?.seoKeywords || collection.seoKeywords,
  });
}

export default async function CollectionLandingPage({ params }: { params: { slug: string } }) {
  const [collectionResult, productsResult, pageResult] = await Promise.all([
    getCatalogCollectionBySlug(params.slug),
    getCatalogProducts(),
    getCatalogPageBySlug(`collection-${params.slug}`),
  ]);
  const collection = collectionResult.data;
  const page = pageResult.data;

  if (!collection) {
    notFound();
  }

  const [settingsMap, contentMap] = await Promise.all([
    getCollectionAdminSettingsMap([collection.id ?? collection.slug]),
    getCollectionPageContentMap([collection.id ?? collection.slug]),
  ]);
  const settings = settingsMap[collection.id ?? collection.slug] ?? (await getCollectionAdminSettingsBySlug(params.slug));
  const collectionPageBody = contentMap[collection.id ?? collection.slug]?.body;
  const collectionProducts = settings
    ? resolveCollectionProducts({
        collection,
        products: productsResult.data,
        settings,
      })
    : productsResult.data.filter((product) => product.collectionId === collection.id);

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={collectionResult.source} error={collectionResult.error} />
      <PageHero
        eyebrow="Collection"
        title={page?.title || collection.title}
        description={page?.excerpt || collection.description}
      />
      {settings?.showIntroSection !== false ? (
        <section className="brand-section">
          <div className="brand-container max-w-5xl">
            {Array.isArray(collectionPageBody) && collectionPageBody.length ? (
              <CmsPageRenderer bodyText={JSON.stringify(collectionPageBody, null, 2)} />
            ) : page ? (
              <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
            ) : (
              <div className="rounded-[28px] border border-brand-sand/40 bg-brand-cream p-8 text-brand-warm">
                Create a page in the admin with slug <strong>{`collection-${collection.slug}`}</strong> to add a custom collection landing page with hero content, storytelling sections, and SEO copy.
              </div>
            )}
          </div>
        </section>
      ) : null}
      <section className="brand-section pt-10 md:pt-14">
        <div className="brand-container">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="brand-label">Collection products</p>
              <h2 className="mt-2 font-serif text-4xl text-brand-brown">Products in {collection.title}</h2>
            </div>
            <div className="text-sm text-brand-taupe">{collectionProducts.length} items</div>
          </div>
          {collectionProducts.length ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {collectionProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-brand-sand/40 bg-brand-cream p-8 text-brand-warm">
              No products are currently assigned or matched for this collection.
            </div>
          )}
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
