import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Wishlist",
  description: "Save handcrafted Sofi Knots products to a wishlist for future purchase.",
  path: "/wishlist",
});

export default function WishlistPage() {
  return (
    <div>
      <Navbar />
      <PageHero eyebrow="Customer Features" title="Wishlist" description="Wishlist persistence can be added later with Supabase user accounts or guest browser storage." />
      <section className="brand-section">
        <div className="brand-container rounded-sm border border-brand-sand/40 p-8 text-sm text-brand-warm">
          Wishlist functionality will be connected after auth and customer profiles are in place.
        </div>
      </section>
      <Footer />
    </div>
  );
}
