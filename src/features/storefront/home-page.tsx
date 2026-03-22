import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Sparkles, Star } from "lucide-react";
import { DataSourceNote } from "@/components/site/data-source-note";
import { ProductCard } from "@/components/site/product-card";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { groupVisualSections, type VisualContentBlock, type VisualSection } from "@/lib/cms-blocks";
import { getCatalogCollections, getCatalogPageBySlug, getFeaturedProducts } from "@/lib/catalog";
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
  const [featuredResult, collectionResult, homepageCmsResult, reviews] = await Promise.all([
    getFeaturedProducts(),
    getCatalogCollections(),
    getCatalogPageBySlug("home"),
    getReviews().catch(() => []),
  ]);

  const featuredProducts = featuredResult.data;
  const storefrontCollections = collectionResult.data;
  const homepageCms = homepageCmsResult.data;

  const sections = getSectionsFromBody(homepageCms?.body);

  const heroSection = findSection(sections, ["homepage hero", "hero"], 0);
  const introSection = findSection(sections, ["welcome intro", "intro", "brand story"], 1);
  const collectionsSection = findSection(sections, ["collections"], 2);
  const featuredSection = findSection(sections, ["featured products", "bestsellers"], 3);
  const valuesSection = findSection(sections, ["why sofi knots", "crafted with intention", "our craft"], 4);
  const testimonialsSection = findSection(sections, ["testimonials", "customer love", "kind words"], 5);
  const newsletterSection = findSection(sections, ["newsletter", "stay connected"], 6);

  const heroCtas = getSectionCtas(heroSection, [
    { label: "Shop collection", href: "/shop" },
    { label: "Our story", href: "/about" },
  ]);
  const introCards = getSectionCards(introSection, [
    { title: "Free Shipping Over 375", description: "Set the trust signals that help customers convert faster." },
    { title: "Artisan Guarantee", description: "Use this slot for your handmade quality promise." },
    { title: "Organic Materials", description: "Highlight premium fibers or material sourcing." },
    { title: "4.9 Customer Rating", description: "Surface your strongest social-proof metric." },
  ]);
  const craftCtas = getSectionCtas(valuesSection, [{ label: "Our story", href: "/about" }]);
  const featuredReviews = reviews
    .filter((review) => review.status === "approved" && review.homepageFeature)
    .slice(0, 3);

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={homepageCmsResult.source} error={homepageCmsResult.error || featuredResult.error} />
      <section className="relative min-h-[68vh] overflow-hidden border-b border-brand-sand/30 bg-[#e9ddce] lg:min-h-[78vh]">
        <div className="absolute inset-0">
          {getSectionImageUrl(heroSection) ? (
            <img src={getSectionImageUrl(heroSection) || ""} alt={getSectionHeading(heroSection, "Sofi Knots hero")} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_18%_30%,rgba(255,255,255,0.42),transparent_28%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.18),transparent_18%),linear-gradient(135deg,#b9946c_0%,#d2b190_42%,#a57f58_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(72,54,35,0.48)_0%,rgba(72,54,35,0.18)_34%,rgba(72,54,35,0.04)_58%,rgba(72,54,35,0.02)_100%)]" />
        </div>
        <div className="brand-container relative flex min-h-[68vh] items-center py-16 lg:min-h-[78vh] lg:py-24">
          <div className="max-w-xl text-brand-ivory">
            <p className="mb-5 text-[10px] uppercase tracking-[0.34em] text-brand-ivory/80">
              {heroSection?.label || "Handcrafted with intention"}
            </p>
            <h1 className="max-w-lg font-serif text-[clamp(3rem,7vw,5.5rem)] leading-[0.92] tracking-[-0.03em] text-white">
              {getSectionHeading(heroSection, "Where Every Knot Tells a Story")}
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-brand-ivory/86 sm:text-base">
              {getSectionParagraph(heroSection, "Artisan macrame pieces crafted from premium fibers for the spaces and moments you cherish most.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroCtas.map((cta) => (
                <Link
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  className={
                    cta.style === "secondary"
                      ? "inline-flex items-center justify-center border border-white/40 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-white transition hover:bg-white hover:text-brand-brown"
                      : "inline-flex items-center justify-center bg-white px-6 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-brand-brown transition hover:bg-brand-cream"
                  }
                >
                  {cta.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-sand/20 bg-[#fbf7f1]">
        <div className="brand-container grid grid-cols-2 gap-4 py-5 text-center md:grid-cols-4">
          {[Sparkles, ShieldCheck, Leaf, Star].map((Icon, index) => {
            const card = introCards[index] ?? introCards[0];
            return (
              <div key={`${card.title}-${index}`} className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-brand-warm">
                <Icon size={13} className="text-brand-gold" />
                <span>{card.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#fcfaf5] py-20 lg:py-24">
        <div className="brand-container">
          <div className="mb-12 text-center">
            <p className="brand-label mb-3">{collectionsSection?.label || "Curated for you"}</p>
            <h2 className="font-serif text-[clamp(2.3rem,4vw,3.6rem)] text-brand-brown">
              {getSectionHeading(collectionsSection, "Our Collections")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {storefrontCollections.slice(0, 4).map((collection, index) => (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-[0.82] overflow-hidden bg-brand-cream">
                  {collection.imageUrl ? (
                    <img
                      src={collection.imageUrl}
                      alt={collection.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#efe3d2_0%,#dfccb5_100%)] p-6 text-center">
                      <div>
                        <p className="brand-label mb-3">Media needed</p>
                        <p className="font-serif text-2xl text-brand-brown">{collection.title}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-1 pb-1 pt-4">
                  <h3 className="font-serif text-xl text-brand-brown">{collection.title}</h3>
                  <p className="mt-1 text-sm text-brand-taupe">{index + 8} pieces</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f3ea] py-20 lg:py-24">
        <div className="brand-container">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="brand-label mb-3">{featuredSection?.label || "Most loved"}</p>
              <h2 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] text-brand-brown">
                {getSectionHeading(featuredSection, "Best Sellers")}
              </h2>
            </div>
            <Link href="/shop" className="hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-brand-warm transition hover:text-brand-gold md:inline-flex">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fcfaf5] py-20 lg:py-24">
        <div className="brand-container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative aspect-[1.08] overflow-hidden bg-brand-cream">
            {getSectionImageUrl(valuesSection) ? (
              <img src={getSectionImageUrl(valuesSection) || ""} alt={getSectionHeading(valuesSection, "Our craft")} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#efe3d2_0%,#dcc6ad_100%)] p-8 text-center">
                <div>
                  <p className="brand-label mb-3">Media needed</p>
                  <p className="max-w-sm font-serif text-3xl leading-tight text-brand-brown">Add a craft image from Media Library in the Home page editor.</p>
                </div>
              </div>
            )}
          </div>
          <div className="max-w-xl">
            <p className="brand-label mb-4">{valuesSection?.label || "Our craft"}</p>
            <h2 className="font-serif text-[clamp(2.4rem,4vw,4rem)] leading-[1.02] text-brand-brown">
              {getSectionHeading(valuesSection, "Made by Hand, Made with Heart")}
            </h2>
            <p className="mt-6 text-sm leading-7 text-brand-warm sm:text-base">
              {getSectionParagraph(valuesSection, "Every Sofi Knots piece begins with a single strand of premium fiber and hours of careful knotting, shaped into keepsake pieces for modern homes and gifting.")}
            </p>
            <div className="mt-8">
              <Link
                href={craftCtas[0]?.href || "/about"}
                className="inline-flex items-center gap-3 border-b border-brand-brown pb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-brand-brown transition hover:text-brand-gold hover:border-brand-gold"
              >
                {craftCtas[0]?.label || "Our story"} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#453d35] py-20 text-white lg:py-24">
        <div className="brand-container">
          <div className="mb-14 text-center">
            <p className="mb-4 text-[10px] uppercase tracking-[0.34em] text-white/60">{testimonialsSection?.label || "Kind words"}</p>
            <h2 className="font-serif text-[clamp(2.3rem,4vw,3.7rem)] text-white">
              {getSectionHeading(testimonialsSection, "What Our Customers Say")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {(featuredReviews.length ? featuredReviews : reviews.filter((review) => review.status === "approved").slice(0, 3)).map((review) => (
              <article key={review.id} className="border border-white/10 px-6 py-8">
                <div className="mb-4 flex items-center gap-1 text-brand-gold">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} size={11} className="fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-7 text-white/82">{review.message}</p>
                <div className="mt-8 border-t border-white/10 pt-5">
                  <p className="font-serif text-lg text-white">{review.customerName}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fcfaf5] py-20 lg:py-24">
        <div className="brand-container mx-auto max-w-3xl text-center">
          <p className="brand-label mb-4">{newsletterSection?.label || "Stay connected"}</p>
          <h2 className="font-serif text-[clamp(2.2rem,4vw,3.4rem)] text-brand-brown">
            {getSectionHeading(newsletterSection, "Join Our Circle")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-brand-warm">
            {getSectionParagraph(newsletterSection, "Be the first to know about new collections, artisan stories, and exclusive offers.")}
          </p>
          <form className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input type="email" placeholder="Your email address" className="brand-input flex-1 bg-transparent" />
            <button type="submit" className="brand-btn-primary min-w-[160px] whitespace-nowrap">
              {getSectionCtas(newsletterSection, [{ label: "Subscribe", href: "#" }])[0]?.label || "Subscribe"}
            </button>
          </form>
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
