import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { WishlistPageClient } from "@/components/wishlist/wishlist-page-client";
import { getCatalogProducts } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return buildStorefrontMetadata({
    title: "Wishlist",
    description: "Save handcrafted Sofi Knots products to a wishlist for future purchase.",
    path: "/wishlist",
  });
}

export default async function WishlistPage() {
  const productsResult = await getCatalogProducts();
  const products = productsResult.data.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    originalPrice: product.originalPrice,
    featuredImageUrl: product.featuredImageUrl,
  }));

  return (
    <div>
      <StorefrontNavbar />
      <PageHero eyebrow="Saved for later" title="Wishlist" description="Keep favorite handcrafted pieces in one place and move them to cart whenever you are ready." />
      <WishlistPageClient products={products} />
      <StorefrontFooter />
    </div>
  );
}
