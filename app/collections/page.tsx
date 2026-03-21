import type { Metadata } from "next";
import Image from "next/image";
import { DataSourceNote } from "@/components/site/data-source-note";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { getCatalogCollections } from "@/lib/catalog";
import { getCollectionImageSource } from "@/lib/media";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Macrame Collections",
  description: "Explore Sofi Knots collections curated around bohemian living, earthy styling, gifting, and handmade keepsakes.",
  path: "/collections",
  keywords: ["macrame collections", "boho decor collections", "artisan handmade gifts"],
});

export default async function CollectionsPage() {
  const result = await getCatalogCollections();

  return (
    <div>
      <Navbar />
      <DataSourceNote source={result.source} error={result.error} />
      <PageHero
        eyebrow="Curated"
        title="Collections Designed Around Stories"
        description="Collections let the admin team group products for campaigns, gifting themes, and on-page SEO landing pages."
      />
      <section className="brand-section">
        <div className="brand-container grid grid-cols-1 gap-6 md:grid-cols-3">
          {result.data.map((collection) => (
            <article key={collection.slug} className="overflow-hidden rounded-sm bg-brand-cream">
              <div className="relative aspect-[3/4]">
                <Image
                  src={getCollectionImageSource(collection)}
                  alt={collection.title}
                  fill
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="h-full w-full object-cover"
                  placeholder={collection.imageUrl ? "empty" : "blur"}
                />
              </div>
              <div className="p-6">
                <p className="brand-label mb-2">SEO Landing Collection</p>
                <h2 className="mb-3 font-serif text-3xl text-brand-brown">{collection.title}</h2>
                <p className="text-sm leading-relaxed text-brand-warm">{collection.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
