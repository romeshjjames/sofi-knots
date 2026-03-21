import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DataSourceNote } from "@/components/site/data-source-note";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { ProductActionButtons } from "@/components/site/product-action-buttons";
import { getCatalogProductBySlug } from "@/lib/catalog";
import { getProductImageSource } from "@/lib/media";
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
      <Footer />
    </div>
  );
}
