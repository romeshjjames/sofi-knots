import { CmsPageRenderer } from "@/components/site/cms-page-renderer";
import { DataSourceNote } from "@/components/site/data-source-note";
import { ProductCard } from "@/components/site/product-card";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogCollections, getCatalogPageBySlug, getFeaturedProducts, getNewArrivalProducts } from "@/lib/catalog";

export async function HomePage() {
  const [featuredResult, newArrivalResult, collectionResult, homepageCmsResult] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivalProducts(),
    getCatalogCollections(),
    getCatalogPageBySlug("home"),
  ]);
  const featuredProducts = featuredResult.data;
  const newArrivals = newArrivalResult.data;
  const storefrontCollections = collectionResult.data;
  const homepageCms = homepageCmsResult.data;

  if (homepageCms) {
    return (
      <div>
        <StorefrontNavbar />
        <DataSourceNote source={homepageCmsResult.source} error={homepageCmsResult.error} />
        <section className="brand-section pb-0">
          <div className="brand-container max-w-5xl">
            <CmsPageRenderer bodyText={JSON.stringify(homepageCms.body ?? [], null, 2)} />
          </div>
        </section>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={featuredResult.source} error={featuredResult.error} />
      <section className="brand-section">
        <div className="brand-container max-w-5xl">
          <div className="rounded-[28px] border border-brand-sand/40 bg-brand-cream/50 p-8 text-brand-warm">
            Homepage content is being prepared. Open the <strong>Home</strong> page in the admin panel to publish the homepage story and layout.
          </div>
        </div>
      </section>
      <section className="brand-section pt-0">
        <div className="brand-container">
          <div className="mb-8">
            <p className="brand-label mb-2">Featured products</p>
            <h2 className="font-serif text-4xl text-brand-brown">Live catalog highlights</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="brand-section pt-0">
        <div className="brand-container">
          <div className="mb-8">
            <p className="brand-label mb-2">New arrivals</p>
            <h2 className="font-serif text-4xl text-brand-brown">Latest live products</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {newArrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="brand-section pt-0">
        <div className="brand-container">
          <div className="mb-8">
            <p className="brand-label mb-2">Collections</p>
            <h2 className="font-serif text-4xl text-brand-brown">Active storefront collections</h2>
          </div>
          <div className="rounded-[28px] border border-brand-sand/40 bg-white px-6 py-5 text-sm text-brand-warm">
            {storefrontCollections.length} collections are live and can be edited from the Collections admin.
          </div>
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
}
