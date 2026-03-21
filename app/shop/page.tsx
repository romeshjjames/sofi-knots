import type { Metadata } from "next";
import { DataSourceNote } from "@/components/site/data-source-note";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { ProductCard } from "@/components/site/product-card";
import { getCatalogProducts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shop Handmade Macrame Products",
  description: "Browse handcrafted macrame bags, home decor, wall art, gifts, and accessories from Sofi Knots.",
  path: "/shop",
  keywords: ["shop macrame online", "handmade decor store", "macrame products india"],
});

export default async function ShopPage() {
  const result = await getCatalogProducts();

  return (
    <div>
      <Navbar />
      <DataSourceNote source={result.source} error={result.error} />
      <PageHero
        eyebrow="Storefront"
        title="Shop Handmade Macrame"
        description="Every product in the Sofi Knots catalog is designed to feel artisanal, giftable, and ready for a premium online store experience."
      />
      <section className="brand-section">
        <div className="brand-container grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {result.data.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
