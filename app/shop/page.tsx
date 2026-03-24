import type { Metadata } from "next";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { DataSourceNote } from "@/components/site/data-source-note";
import { PageHero } from "@/components/site/page-hero";
import { ProductCard } from "@/components/site/product-card";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogPageBySlug, getCatalogProducts } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const pageResult = await getCatalogPageBySlug("shop");
  const page = pageResult.data;

  return buildStorefrontMetadata({
    title: page?.seoTitle || "Shop Handmade Macrame Products",
    description: page?.seoDescription || "Browse handcrafted macrame bags, home decor, wall art, gifts, and accessories from Sofi Knots.",
    path: "/shop",
    keywords: page?.seoKeywords || ["shop macrame online", "handmade decor store", "macrame products india"],
  });
}

export default async function ShopPage() {
  const [result, pageResult] = await Promise.all([getCatalogProducts(), getCatalogPageBySlug("shop")]);
  const page = pageResult.data;

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={result.source} error={result.error} />
      <PageHero
        eyebrow="Storefront"
        title={page?.title || "Shop Handmade Macrame"}
        description={page?.excerpt || "Every product in the Sofi Knots catalog is designed to feel artisanal, giftable, and ready for a premium online store experience."}
      />
      {page ? (
        <section className="brand-section pb-0">
          <div className="brand-container max-w-5xl">
            <CmsPageRenderer bodyText={JSON.stringify(page.body ?? [], null, 2)} />
          </div>
        </section>
      ) : null}
      <section className="brand-section">
        <div className="brand-container grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {result.data.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
