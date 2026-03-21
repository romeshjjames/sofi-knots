import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Shipping and Returns",
  description: "Learn about Sofi Knots shipping timelines, return policy, and handcrafted product fulfillment expectations.",
  path: "/shipping",
  keywords: ["shipping and returns", "handmade order delivery", "macrame shipping india"],
});

export default function ShippingPage() {
  return (
    <div>
      <Navbar />
      <PageHero
        eyebrow="Support"
        title="Shipping and Returns"
        description="This page will later be driven by admin-managed shipping rules and order policy content."
      />
      <section className="brand-section">
        <div className="brand-container grid gap-6 lg:grid-cols-2">
          <div className="rounded-sm bg-brand-cream p-8">
            <h2 className="mb-3 font-serif text-3xl text-brand-brown">Shipping</h2>
            <p className="text-sm leading-relaxed text-brand-warm">Expected delivery timelines, regions served, and free-shipping thresholds will live here.</p>
          </div>
          <div className="rounded-sm bg-brand-cream p-8">
            <h2 className="mb-3 font-serif text-3xl text-brand-brown">Returns</h2>
            <p className="text-sm leading-relaxed text-brand-warm">Return eligibility, damaged item flow, and custom-order exceptions will be managed here.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
