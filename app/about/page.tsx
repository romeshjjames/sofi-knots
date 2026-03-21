import type { Metadata } from "next";
import { getManagedPageMetadata, renderManagedPage } from "@/lib/managed-pages";

const fallback = {
  title: "About Sofi Knots",
  description: "Learn the story behind Sofi Knots and the handcrafted approach shaping every macrame piece.",
  path: "/about",
  keywords: ["about sofi knots", "handmade brand story", "macrame artisan brand"],
  eyebrow: "Brand Story",
  heroTitle: "A Handmade Brand Built for Meaningful Commerce",
  heroDescription: "Sofi Knots is positioned as an artisan-led macrame label where every page, product, and collection can eventually be controlled from the admin panel.",
  body: (
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
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  return getManagedPageMetadata("about", fallback);
}

export default async function AboutPage() {
  return renderManagedPage("about", fallback);
}
