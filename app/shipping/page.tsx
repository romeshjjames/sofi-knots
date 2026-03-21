import type { Metadata } from "next";
import { getManagedPageMetadata, renderManagedPage } from "@/lib/managed-pages";

const fallback = {
  title: "Shipping and Returns",
  description: "Learn about Sofi Knots shipping timelines, return policy, and handcrafted product fulfillment expectations.",
  path: "/shipping",
  keywords: ["shipping and returns", "handmade order delivery", "macrame shipping india"],
  eyebrow: "Support",
  heroTitle: "Shipping and Returns",
  heroDescription: "This page is now ready to be driven by admin-managed shipping rules and policy content.",
  body: (
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
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  return getManagedPageMetadata("shipping", fallback);
}

export default async function ShippingPage() {
  return renderManagedPage("shipping", fallback);
}
