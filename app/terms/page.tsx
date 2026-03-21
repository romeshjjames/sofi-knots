import type { Metadata } from "next";
import { getManagedPageMetadata, renderManagedPage } from "@/lib/managed-pages";

const fallback = {
  title: "Terms and Conditions",
  description: "Review the Sofi Knots terms and conditions for purchasing, payments, and store policies.",
  path: "/terms",
  keywords: ["terms and conditions ecommerce", "purchase policy", "sofi knots terms"],
  eyebrow: "Policy",
  heroTitle: "Terms and Conditions",
  heroDescription: "This legal page is part of the storefront trust and SEO foundation.",
  body: (
    <section className="brand-section">
      <div className="brand-container max-w-3xl text-sm leading-relaxed text-brand-warm">
        Orders, pricing, fulfillment timelines, and refund eligibility should be documented here once the live commerce workflows are finalized.
      </div>
    </section>
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  return getManagedPageMetadata("terms", fallback);
}

export default async function TermsPage() {
  return renderManagedPage("terms", fallback);
}
