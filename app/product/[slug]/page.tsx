import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { DataSourceNote } from "@/components/site/data-source-note";
import { ProductActionButtons } from "@/components/site/product-action-buttons";
import { ProductGallery } from "@/components/site/product-gallery";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getProductImages, getProductPageContentMap } from "@/lib/admin-data";
import { getCatalogProductBySlug } from "@/lib/catalog";
import { getApprovedReviewsForProduct } from "@/lib/reviews";
import { buildStorefrontMetadata, productJsonLd } from "@/lib/seo";
import { getStorefrontSettings } from "@/lib/storefront";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getCatalogProductBySlug(params.slug);
  const product = result.data;

  if (!product) {
    return buildStorefrontMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
      path: `/product/${params.slug}`,
    });
  }

  return buildStorefrontMetadata({
    title: product.seoTitle,
    description: product.seoDescription,
    path: `/product/${product.slug}`,
    keywords: product.seoKeywords,
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const result = await getCatalogProductBySlug(params.slug);
  const product = result.data;

  if (!product) {
    notFound();
  }

  const storefront = await getStorefrontSettings();
  const reviews = await getApprovedReviewsForProduct({ productId: product.id, productSlug: product.slug });
  const contentMap = await getProductPageContentMap([product.id]);
  const galleryImages = await getProductImages(product.id);
  const pageBody = contentMap[product.id]?.body;
  const hasComparePrice = typeof product.originalPrice === "number";
  const displayPrice = hasComparePrice ? Math.min(product.price, product.originalPrice as number) : product.price;
  const displayComparePrice =
    hasComparePrice && product.originalPrice !== product.price
      ? Math.max(product.price, product.originalPrice as number)
      : null;

  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    image: product.featuredImageUrl || storefront.socialSharingImage || `${storefront.siteUrl}/placeholder.svg`,
    sku: product.slug,
    price: product.price,
    brandName: storefront.siteName,
    siteUrl: storefront.siteUrl,
  });

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StorefrontNavbar />
      <DataSourceNote source={result.source} error={result.error} />
      <section className="brand-section">
        <div className="brand-container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-sm bg-brand-cream">
            <ProductGallery
              productName={product.name}
              featuredImageUrl={product.featuredImageUrl}
              images={galleryImages}
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="brand-label mb-3">{product.category}</p>
            <h1 className="brand-heading mb-4">{product.name}</h1>
            <p className="mb-4 text-lg text-brand-warm">{product.shortDescription}</p>
            <div className="mb-6 flex flex-col gap-1">
              {displayComparePrice ? (
                <span className="text-sm text-brand-taupe line-through">Rs. {displayComparePrice.toLocaleString("en-IN")}</span>
              ) : null}
              <span className="text-2xl font-medium text-brand-brown">Rs. {displayPrice.toLocaleString("en-IN")}</span>
            </div>
            <p className="mb-8 text-sm leading-relaxed text-brand-warm">{product.description}</p>
            <ProductActionButtons
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              category={product.category}
              productImageUrl={product.featuredImageUrl}
            />
            <div className="mt-8 rounded-sm bg-brand-cream p-6">
              <h2 className="text-lg font-medium text-brand-warm">
                {product.seoTitle || product.name}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-brand-warm">
                {product.seoDescription || product.shortDescription || product.description}
              </p>
            </div>
          </div>
        </div>
      </section>
      {reviews.length ? (
        <section className="brand-section border-t border-brand-sand/30 bg-white">
          <div className="brand-container">
            <div className="mb-8">
              <p className="brand-label mb-3">Customer reviews</p>
              <h2 className="brand-heading text-[clamp(1.8rem,4vw,3rem)]">What customers are saying</h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-sm border border-brand-sand/35 bg-brand-cream px-6 py-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-brand-brown">{review.customerName}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-brand-taupe">{review.reviewDate}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-brown text-sm font-medium text-white">
                      {review.customerInitials}
                    </div>
                  </div>
                  <p className="mt-4 text-sm tracking-[0.18em] text-brand-gold">{`${"★".repeat(review.rating)}${"☆".repeat(Math.max(0, 5 - review.rating))}`}</p>
                  <h3 className="mt-3 text-xl font-medium text-brand-brown">{review.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-brand-warm">{review.message}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      {Array.isArray(pageBody) && pageBody.length ? (
        <section className="brand-section border-t border-brand-sand/30 bg-white">
          <div className="brand-container max-w-5xl">
            <p className="brand-label mb-4">Product story</p>
            <CmsPageRenderer bodyText={JSON.stringify(pageBody, null, 2)} />
          </div>
        </section>
      ) : null}
      <StorefrontFooter />
    </div>
  );
}
