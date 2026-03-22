import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote, Scissors, Shield, Star, Truck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { DataSourceNote } from "@/components/site/data-source-note";
import { ProductCard } from "@/components/site/product-card";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { defaultHomepageSections, getHomepageMerchandising, type HomepageSectionKey } from "@/lib/admin-data";
import { groupVisualSections, type VisualContentBlock, type VisualSection } from "@/lib/cms-blocks";
import { getCatalogCollections, getCatalogPageBySlug, getFeaturedProducts, getNewArrivalProducts } from "@/lib/catalog";
import { getCollectionImageSource } from "@/lib/media";
import { getReviews } from "@/lib/reviews";

type HomepageCard = {
  title: string;
  description: string;
};

function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getSectionsFromBody(body: unknown) {
  return groupVisualSections(JSON.stringify(body ?? [], null, 2));
}

function findSection(sections: VisualSection[], keywords: string[], fallbackIndex: number) {
  const matched = sections.find((section) => {
    const label = normalizeLabel(section.label);
    return keywords.some((keyword) => label.includes(normalizeLabel(keyword)));
  });

  return matched ?? sections[fallbackIndex] ?? null;
}

function extractBlocks<T extends VisualContentBlock["type"]>(section: VisualSection | null, type: T) {
  if (!section) return [] as Extract<VisualContentBlock, { type: T }>[];
  return section.blocks.filter((block): block is Extract<VisualContentBlock, { type: T }> => block.type === type);
}

function getSectionHeading(section: VisualSection | null, fallback: string, level?: "h2" | "h3") {
  const headings = extractBlocks(section, "heading");
  const match = level ? headings.find((block) => block.level === level) : headings[0];
  return match?.content || fallback;
}

function getSectionParagraph(section: VisualSection | null, fallback: string, index = 0) {
  const paragraphs = extractBlocks(section, "paragraph");
  return paragraphs[index]?.content || fallback;
}

function getSectionCtas(section: VisualSection | null, fallback: { label: string; href: string }[]) {
  const ctas = extractBlocks(section, "cta").map((block) => ({
    label: block.label || "Learn more",
    href: block.href || "#",
    style: block.style ?? "primary",
  }));
  return ctas.length ? ctas : fallback.map((item, index) => ({ ...item, style: index === 0 ? "primary" : "secondary" as const }));
}

function getSectionImageUrl(section: VisualSection | null) {
  return extractBlocks(section, "image")[0]?.url || null;
}

function getSectionCards(section: VisualSection | null, fallback: HomepageCard[]) {
  if (!section) return fallback;

  const headings = extractBlocks(section, "heading").filter((block) => block.level === "h3");
  const paragraphs = extractBlocks(section, "paragraph");
  const cards = headings.map((heading, index) => ({
    title: heading.content,
    description: paragraphs[index + 1]?.content || paragraphs[index]?.content || "",
  })).filter((card) => card.title || card.description);

  return cards.length ? cards : fallback;
}

export async function HomePage() {
  const [featuredResult, newArrivalResult, collectionResult, homepageCmsResult, homepageMerchandising, reviews] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivalProducts(),
    getCatalogCollections(),
    getCatalogPageBySlug("home"),
    getHomepageMerchandising().catch(() => ({ sectionOrder: [], updatedAt: null })),
    getReviews().catch(() => []),
  ]);

  const featuredProducts = featuredResult.data;
  const newArrivals = newArrivalResult.data;
  const storefrontCollections = collectionResult.data;
  const homepageCms = homepageCmsResult.data;
  const sectionOrder = homepageMerchandising.sectionOrder.length
    ? homepageMerchandising.sectionOrder
    : defaultHomepageSections.map((section) => section.key);

  const sections = getSectionsFromBody(homepageCms?.body);

  const heroSection = findSection(sections, ["homepage hero", "hero"], 0);
  const introSection = findSection(sections, ["welcome intro", "intro", "brand story"], 1);
  const collectionsSection = findSection(sections, ["collections"], 2);
  const featuredSection = findSection(sections, ["featured products", "bestsellers"], 3);
  const arrivalsSection = findSection(sections, ["new arrivals", "arrivals"], 4);
  const valuesSection = findSection(sections, ["why sofi knots", "crafted with intention"], 5);
  const testimonialsSection = findSection(sections, ["testimonials", "customer love"], 6);
  const newsletterSection = findSection(sections, ["newsletter", "stay connected"], 7);

  const heroCtas = getSectionCtas(heroSection, [
    { label: "Shop collection", href: "/shop" },
    { label: "Our story", href: "/about" },
  ]);
  const valuesCards = getSectionCards(valuesSection, [
    { title: "Handmade with Love", description: "Every knot is tied by hand with care and patience." },
    { title: "Premium Materials", description: "We use natural cotton cord and carefully selected accessories." },
    { title: "Thoughtful Packaging", description: "Every order is packed beautifully for gifting and safe delivery." },
  ]);
  const featuredReviews = reviews
    .filter((review) => review.status === "approved" && review.homepageFeature)
    .slice(0, 3);

  const renderedSections: Record<HomepageSectionKey, React.ReactNode> = {
    hero: (
      <section className="relative flex min-h-[85vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          {getSectionImageUrl(heroSection) ? (
            <img src={getSectionImageUrl(heroSection) || ""} alt={getSectionHeading(heroSection, "Sofi Knots hero")} className="h-full w-full object-cover" />
          ) : (
            <Image src={heroBg} alt="Sofi Knots macrame collection" className="h-full w-full object-cover" priority />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, hsla(40,33%,97%,0.88) 0%, hsla(40,33%,97%,0.55) 60%, transparent 100%)",
            }}
          />
        </div>
        <div className="brand-container relative max-w-2xl py-24 lg:py-32">
          <p className="brand-label mb-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {heroSection?.label || "Homepage hero"}
          </p>
          <h1 className="brand-heading mb-6 text-5xl sm:text-6xl lg:text-7xl animate-fade-in" style={{ animationDelay: "400ms" }}>
            {getSectionHeading(heroSection, "Handcrafted for modern living")}
          </h1>
          <p className="brand-subheading mb-8 max-w-lg animate-fade-in" style={{ animationDelay: "600ms" }}>
            {getSectionParagraph(heroSection, "Discover handcrafted macrame pieces that bring warmth, texture, and artisan charm to your world.")}
          </p>
          <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "800ms" }}>
            {heroCtas.map((cta) => (
              <Link
                key={`${cta.href}-${cta.label}`}
                href={cta.href}
                className={cta.style === "secondary" ? "brand-btn-outline" : "brand-btn-primary"}
              >
                {cta.label}
                {cta.style === "secondary" ? null : <ArrowRight size={16} className="ml-2" />}
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),
    intro: (
      <section className="brand-section">
        <div className="brand-container mx-auto max-w-2xl text-center">
          <p className="brand-label mb-3">{introSection?.label || "Welcome intro"}</p>
          <h2 className="brand-heading mb-4">{getSectionHeading(introSection, "Welcome to Sofi Knots")}</h2>
          <div className="brand-divider mb-6" />
          <p className="leading-relaxed text-brand-warm">
            {getSectionParagraph(introSection, "Every piece in our collection is lovingly handcrafted using premium natural cotton cord and age-old knotting techniques.")}
          </p>
        </div>
      </section>
    ),
    collections: (
      <section className="brand-section bg-brand-cream pt-0">
        <div className="brand-container">
          <div className="mb-12 text-center">
            <p className="brand-label mb-3">{collectionsSection?.label || "Collections"}</p>
            <h2 className="brand-heading">{getSectionHeading(collectionsSection, "Our Collections")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-brand-warm">
              {getSectionParagraph(collectionsSection, "Explore curated handcrafted collections organized by mood, gifting intent, and everyday styling.")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {storefrontCollections.map((collection, index) => (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Image
                  src={getCollectionImageSource(collection)}
                  alt={collection.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  placeholder={collection.imageUrl ? "empty" : "blur"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="mb-1 text-xs uppercase tracking-[0.2em]" style={{ color: "hsla(40,33%,97%,0.8)" }}>
                    {collection.description}
                  </p>
                  <h3 className="font-serif text-2xl font-medium text-brand-ivory">{collection.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),
    "featured-products": (
      <section className="brand-section">
        <div className="brand-container">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="brand-label mb-2">{featuredSection?.label || "Featured products"}</p>
              <h2 className="brand-heading">{getSectionHeading(featuredSection, "Bestsellers")}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-warm">
                {getSectionParagraph(featuredSection, "Highlight the products customers return to again and again with a short editorial introduction.")}
              </p>
            </div>
            <Link href="/shop" className="hidden items-center gap-1 text-sm font-medium text-brand-gold transition-colors hover:text-brand-warm sm:flex">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
    ),
    "new-arrivals": (
      <section className="brand-section bg-brand-cream pt-0">
        <div className="brand-container">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="brand-label mb-2">{arrivalsSection?.label || "New arrivals"}</p>
              <h2 className="brand-heading">{getSectionHeading(arrivalsSection, "New Arrivals")}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-brand-warm">
                {getSectionParagraph(arrivalsSection, "Use this section to frame new launches, seasonal drops, or limited small-batch releases.")}
              </p>
            </div>
            <Link href="/shop" className="hidden items-center gap-1 text-sm font-medium text-brand-gold transition-colors hover:text-brand-warm sm:flex">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {newArrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
    ),
    "value-props": (
      <section className="brand-section">
        <div className="brand-container">
          <div className="mb-14 text-center">
            <p className="brand-label mb-3">{valuesSection?.label || "Why Sofi Knots"}</p>
            <h2 className="brand-heading">{getSectionHeading(valuesSection, "Crafted with Intention")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-brand-warm">
              {getSectionParagraph(valuesSection, "Introduce the values that make the brand feel premium and personal.")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-12">
            {[Scissors, Shield, Truck].map((Icon, index) => {
              const card = valuesCards[index] ?? valuesCards[0];
              return (
                <div key={`${card.title}-${index}`} className="text-center animate-fade-in" style={{ animationDelay: `${index * 120}ms` }}>
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream">
                    <Icon size={22} className="text-brand-gold" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl text-brand-brown">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-warm">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    ),
    testimonials: (
      <section className="brand-section bg-brand-cream">
        <div className="brand-container">
          <div className="mb-14 text-center">
            <p className="brand-label mb-3">{testimonialsSection?.label || "Testimonials"}</p>
            <h2 className="brand-heading">{getSectionHeading(testimonialsSection, "What Our Customers Say")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-brand-warm">
              {getSectionParagraph(testimonialsSection, "Approved featured reviews from the Reviews admin appear here automatically.")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
            {(featuredReviews.length ? featuredReviews : reviews.filter((review) => review.status === "approved").slice(0, 3)).map((review, index) => (
              <div key={review.id} className="rounded-sm bg-brand-ivory p-8 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <Quote size={24} className="mb-4 text-brand-gold/40" />
                <p className="mb-5 text-sm leading-relaxed text-brand-warm">{review.message}</p>
                <div className="mb-2 flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, starIndex) => (
                    <Star key={starIndex} size={12} className="fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="font-serif text-base text-brand-brown">{review.customerName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    newsletter: (
      <section className="brand-section">
        <div className="brand-container mx-auto max-w-xl text-center">
          <p className="brand-label mb-3">{newsletterSection?.label || "Newsletter"}</p>
          <h2 className="brand-heading mb-4">{getSectionHeading(newsletterSection, "Join the Sofi Knots Family")}</h2>
          <p className="mb-8 text-sm text-brand-warm">
            {getSectionParagraph(newsletterSection, "Subscribe for early access to new collections, styling inspiration, and exclusive offers.")}
          </p>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input type="email" placeholder="Your email address" className="brand-input flex-1" />
            <button type="submit" className="brand-btn-primary whitespace-nowrap">
              {getSectionCtas(newsletterSection, [{ label: "Subscribe", href: "#" }])[0]?.label || "Subscribe"}
            </button>
          </form>
        </div>
      </section>
    ),
  };

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={homepageCmsResult.source} error={homepageCmsResult.error || featuredResult.error} />
      {sectionOrder.map((sectionKey) => (
        <div key={sectionKey}>{renderedSections[sectionKey]}</div>
      ))}
      <StorefrontFooter />
    </div>
  );
}
