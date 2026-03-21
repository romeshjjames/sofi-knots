import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms and Conditions",
  description: "Review the Sofi Knots terms and conditions for purchasing, payments, and store policies.",
  path: "/terms",
  keywords: ["terms and conditions ecommerce", "purchase policy", "sofi knots terms"],
});

export default function TermsPage() {
  return (
    <div>
      <Navbar />
      <PageHero eyebrow="Policy" title="Terms and Conditions" description="This legal page is included in the SEO and trust foundation for the storefront." />
      <section className="brand-section">
        <div className="brand-container max-w-3xl text-sm leading-relaxed text-brand-warm">
          Orders, pricing, fulfillment timelines, and refund eligibility should be documented here once the live commerce workflows are finalized.
        </div>
      </section>
      <Footer />
    </div>
  );
}
