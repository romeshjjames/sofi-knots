import type { Metadata } from "next";
import { Suspense } from "react";
import { CartCheckout } from "@/components/checkout/cart-checkout";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogProducts } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildStorefrontMetadata({
    title: "Your Cart",
    description: "Review your Sofi Knots cart, update quantities, and proceed to secure checkout.",
    path: "/cart",
  });
}

export default async function CartPage() {
  const catalog = await getCatalogProducts();

  return (
    <div>
      <StorefrontNavbar />
      <PageHero eyebrow="Checkout" title="Cart" description="Review your selected pieces, update quantities, and continue to secure checkout." />
      <section className="brand-section">
        <div className="brand-container">
          <Suspense fallback={<div className="rounded-sm border border-brand-sand/40 p-6 text-sm text-brand-warm">Loading your cart...</div>}>
            <CartCheckout products={catalog.data} razorpayKeyId={process.env.RAZORPAY_KEY_ID} />
          </Suspense>
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
