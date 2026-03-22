import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { buildStorefrontMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildStorefrontMetadata({
    title: "Wishlist",
    description: "Save handcrafted Sofi Knots products to a wishlist for future purchase.",
    path: "/wishlist",
  });
}

export default function WishlistPage() {
  return (
    <div>
      <StorefrontNavbar />
      <PageHero eyebrow="Customer Features" title="Wishlist" description="Wishlist persistence can be added later with Supabase user accounts or guest browser storage." />
      <section className="brand-section">
        <div className="brand-container rounded-sm border border-brand-sand/40 p-8 text-sm text-brand-warm">
          Wishlist functionality will be connected after auth and customer profiles are in place.
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
