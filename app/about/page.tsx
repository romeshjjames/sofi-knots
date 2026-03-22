import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, Sparkles, ShieldCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { DataSourceNote } from "@/components/site/data-source-note";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { groupVisualSections, type VisualContentBlock, type VisualSection } from "@/lib/cms-blocks";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  return ctas.length
    ? ctas
    : fallback.map((item, index) => ({
        ...item,
        style: index === 0 ? ("primary" as const) : ("secondary" as const),
      }));
}

function getSectionImageUrl(section: VisualSection | null) {
  return extractBlocks(section, "image")[0]?.url || null;
}

function getSectionCards(section: VisualSection | null, fallback: { title: string; description: string }[]) {
  if (!section) return fallback;

  const headings = extractBlocks(section, "heading").filter((block) => block.level === "h3");
  const paragraphs = extractBlocks(section, "paragraph");

  const cards = headings
    .map((heading, index) => ({
      title: heading.content,
      description: paragraphs[index + 1]?.content || paragraphs[index]?.content || "",
    }))
    .filter((card) => card.title || card.description);

  return cards.length ? cards : fallback;
}

export async function generateMetadata(): Promise<Metadata> {
  const aboutResult = await getCatalogPageBySlug("about");
  const about = aboutResult.data;

  return buildStorefrontMetadata({
    title: about?.seoTitle || "About Sofi Knots",
    description:
      about?.seoDescription ||
      "Learn the story behind Sofi Knots and the handcrafted approach shaping every macrame piece.",
    path: "/about",
    keywords: about?.seoKeywords || ["about sofi knots", "handmade brand story", "macrame artisan brand"],
  });
}

export default async function AboutPage() {
  const aboutResult = await getCatalogPageBySlug("about");
  const aboutPage = aboutResult.data;
  const sections = getSectionsFromBody(aboutPage?.body);

  const storySection = findSection(sections, ["brand story", "about story"], 0);
  const valuesSection = findSection(sections, ["craft values", "values"], 1);
  const founderSection = findSection(sections, ["founder note", "studio note"], 2);
  const ctaSection = findSection(sections, ["brand call to action", "cta"], 3);

  const heroCtas = getSectionCtas(storySection, [{ label: "Explore Collections", href: "/collections" }]);
  const valueCards = getSectionCards(valuesSection, [
    { title: "Organic materials", description: "Natural fibers and premium finishes chosen for softness, beauty, and longevity." },
    { title: "Handmade finish", description: "Each piece is shaped slowly by hand so texture, symmetry, and detail feel intentional." },
    { title: "Designed to last", description: "Modern heirloom pieces made for thoughtful gifting and long-term everyday use." },
  ]);
  const founderCtas = getSectionCtas(founderSection, [{ label: "Contact Us", href: "/contact" }]);
  const closingCtas = getSectionCtas(ctaSection, [
    { label: "Shop All", href: "/shop" },
    { label: "Contact Us", href: "/contact" },
  ]);

  return (
    <div>
      <StorefrontNavbar />
      <DataSourceNote source={aboutResult.source} error={aboutResult.error} />

      <section className="relative overflow-hidden border-b border-brand-sand/30 bg-[#efe4d6]">
        <div className="absolute inset-0">
          {getSectionImageUrl(storySection) ? (
            <img
              src={getSectionImageUrl(storySection) || ""}
              alt={getSectionHeading(storySection, "About Sofi Knots")}
              className="h-full w-full object-cover"
            />
          ) : (
            <Image src={heroBg} alt="Sofi Knots story" className="h-full w-full object-cover" priority />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(72,54,35,0.66)_0%,rgba(72,54,35,0.28)_42%,rgba(72,54,35,0.08)_100%)]" />
        </div>
        <div className="brand-container relative py-20 lg:py-28">
          <div className="max-w-2xl text-brand-ivory">
            <p className="mb-5 text-[10px] uppercase tracking-[0.34em] text-brand-ivory/80">
              {storySection?.label || "Brand story"}
            </p>
            <h1 className="max-w-xl font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {getSectionHeading(storySection, "Woven with patience, warmth, and purpose")}
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-brand-ivory/86 sm:text-base">
              {getSectionParagraph(
                storySection,
                "Sofi Knots is a slow craft studio creating handmade macrame pieces that bring softness, warmth, and meaning into modern homes and memorable gifting moments.",
              )}
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

      <section className="bg-[#fcfaf5] py-20 lg:py-24">
        <div className="brand-container grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative aspect-[0.95] overflow-hidden bg-brand-cream">
            {getSectionImageUrl(valuesSection) ? (
              <img
                src={getSectionImageUrl(valuesSection) || ""}
                alt={getSectionHeading(valuesSection, "Craft values")}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image src={heroBg} alt="Sofi Knots craftsmanship" className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="brand-label mb-4">{valuesSection?.label || "Craft values"}</p>
            <h2 className="font-serif text-[clamp(2.3rem,4vw,3.8rem)] leading-[1.02] text-brand-brown">
              {getSectionHeading(valuesSection, "Crafted with intention")}
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-brand-warm sm:text-base">
              {getSectionParagraph(
                valuesSection,
                "Every Sofi Knots piece begins with patient handwork, premium fibers, and a quiet attention to detail that makes each creation feel personal.",
              )}
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[Leaf, ShieldCheck, Sparkles].map((Icon, index) => {
                const card = valueCards[index] ?? valueCards[0];
                return (
                  <div key={`${card.title}-${index}`} className="rounded-[24px] border border-brand-sand/35 bg-white p-5">
                    <Icon size={18} className="text-brand-gold" />
                    <h3 className="mt-4 font-serif text-xl text-brand-brown">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-brand-warm">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6efe6] py-20 lg:py-24">
        <div className="brand-container grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="brand-label mb-4">{founderSection?.label || "Founder note"}</p>
            <h2 className="font-serif text-[clamp(2.3rem,4vw,3.8rem)] leading-[1.02] text-brand-brown">
              {getSectionHeading(founderSection, "A studio rooted in slow craft")}
            </h2>
            <p className="mt-6 text-sm leading-7 text-brand-warm sm:text-base">
              {getSectionParagraph(
                founderSection,
                "Sofi Knots was shaped around the idea that handmade pieces should feel both artful and livable, carrying the softness of craft into everyday spaces.",
              )}
            </p>
            {extractBlocks(founderSection, "quote")[0]?.quote ? (
              <blockquote className="mt-8 rounded-[28px] border border-brand-sand/35 bg-white px-6 py-6">
                <p className="font-serif text-2xl leading-9 text-brand-brown">
                  "{extractBlocks(founderSection, "quote")[0]?.quote}"
                </p>
                {extractBlocks(founderSection, "quote")[0]?.cite ? (
                  <footer className="mt-4 text-xs uppercase tracking-[0.16em] text-brand-taupe">
                    {extractBlocks(founderSection, "quote")[0]?.cite}
                  </footer>
                ) : null}
              </blockquote>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              {founderCtas.map((cta) => (
                <Link
                  key={`${cta.href}-${cta.label}`}
                  href={cta.href}
                  className="inline-flex items-center gap-2 border-b border-brand-brown pb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-brand-brown transition hover:border-brand-gold hover:text-brand-gold"
                >
                  {cta.label} <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
          <div className="relative aspect-[1.02] overflow-hidden bg-brand-cream">
            {getSectionImageUrl(founderSection) ? (
              <img
                src={getSectionImageUrl(founderSection) || ""}
                alt={getSectionHeading(founderSection, "Founder note")}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image src={heroBg} alt="Sofi Knots founder story" className="h-full w-full object-cover" />
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#453d35] py-20 text-white lg:py-24">
        <div className="brand-container text-center">
          <p className="mb-4 text-[10px] uppercase tracking-[0.34em] text-white/60">
            {ctaSection?.label || "Brand call to action"}
          </p>
          <h2 className="mx-auto max-w-3xl font-serif text-[clamp(2.3rem,4vw,3.8rem)] leading-[1.04] text-white">
            {getSectionHeading(ctaSection, "Bring Sofi Knots into your story")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
            {getSectionParagraph(
              ctaSection,
              "Explore our collections, discover handmade pieces for meaningful gifting, or get in touch for a custom creation shaped around your story.",
            )}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {closingCtas.map((cta) => (
              <Link
                key={`${cta.href}-${cta.label}`}
                href={cta.href}
                className={
                  cta.style === "secondary"
                    ? "inline-flex items-center justify-center border border-white/20 bg-white/10 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-white transition hover:bg-white/18"
                    : "inline-flex items-center justify-center bg-brand-gold px-6 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-brand-brown transition hover:bg-[#e1b86a]"
                }
              >
                {cta.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
}
