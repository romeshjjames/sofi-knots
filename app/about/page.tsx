import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Sofi Knots",
  description: "Learn the story behind Sofi Knots and the handcrafted approach shaping every macrame piece.",
  path: "/about",
  keywords: ["about sofi knots", "handmade brand story", "macrame artisan brand"],
});

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <PageHero
        eyebrow="Brand Story"
        title="A Handmade Brand Built for Meaningful Commerce"
        description="Sofi Knots is positioned as an artisan-led macrame label where every page, product, and collection can eventually be controlled from the admin panel."
      />
      <section className="brand-section">
        <div className="brand-container grid gap-10 lg:grid-cols-2">
          <div>
            <p className="brand-label mb-3">Mission</p>
            <h2 className="brand-heading mb-4">Craft with warmth, sell with clarity.</h2>
            <p className="leading-relaxed text-brand-warm">
              The new platform will let your team manage brand story sections, trust-building content, FAQs, and conversion content without developer involvement.
            </p>
          </div>
          <div className="rounded-sm bg-brand-cream p-8">
            <p className="brand-label mb-3">Admin Ready</p>
            <ul className="space-y-3 text-sm leading-relaxed text-brand-warm">
              <li>Editable homepage sections and story modules</li>
              <li>SEO fields for every content page</li>
              <li>Blog content for long-tail Google search visibility</li>
              <li>Future testimonial and gallery management</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
