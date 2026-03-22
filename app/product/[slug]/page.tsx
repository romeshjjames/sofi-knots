import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DataSourceNote } from "@/components/site/data-source-note";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { ProductActionButtons } from "@/components/site/product-action-buttons";
import { getCatalogProductBySlug } from "@/lib/catalog";
import { getProductImageSource } from "@/lib/media";
import { getApprovedReviewsForProduct } from "@/lib/reviews";
import { buildMetadata, productJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getCatalogProductBySlug(params.slug);
  const product = result.data;

  if (!product) {
    return buildMetadata({
      title: "Product Not Found",
      description: "The requested product could not be found.",
      path: `/product/${params.slug}`,
    });
  }

  return buildMetadata({
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

  const reviews = await getApprovedReviewsForProduct({ productId: product.id, productSlug: product.slug });

  const imageSource = getProductImageSource(product);
  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    image: typeof imageSource === "string" ? imageSource : imageSource.src,
    sku: product.slug,
    price: product.price,
  });

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <DataSourceNote source={result.source} error={result.error} />
      <section className="brand-section">
        <div className="brand-container grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-brand-cream">
            <Image
              src={imageSource}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="h-full w-full object-cover"
              priority
              placeholder={product.featuredImageUrl ? "empty" : "blur"}
            />
          </div>
          <div className="flex flex-col justify-center">
            <p className="brand-label mb-3">{product.category}</p>
            <h1 className="brand-heading mb-4">{product.name}</h1>
            <p className="mb-4 text-lg text-brand-warm">{product.shortDescription}</p>
            <div className="mb-6 flex items-center gap-3">
              <span className="text-xl font-medium text-brand-brown">Rs. {product.price.toLocaleString("en-IN")}</span>
              {product.originalPrice ? (
                <span className="text-sm text-brand-taupe line-through">Rs. {product.originalPrice.toLocaleString("en-IN")}</span>
              ) : null}
            </div>
            <p className="mb-8 text-sm leading-relaxed text-brand-warm">{product.description}</p>
            <ProductActionButtons productId={product.id} productSlug={product.slug} productName={product.name} category={product.category} />
            <div className="mt-8 rounded-sm bg-brand-cream p-6">
              <p className="brand-label mb-2">SEO Focus</p>
              <p className="text-sm leading-relaxed text-brand-warm">
                This product page is already set up for unique metadata, canonical URLs, and Product schema markup.
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
      <Footer />
    </div>
  );
}
