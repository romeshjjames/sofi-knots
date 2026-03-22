import type { Metadata } from "next";
import { CartCheckout } from "@/components/checkout/cart-checkout";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogProducts } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildStorefrontMetadata({
    title: "Your Cart",
    description: "Review products in your Sofi Knots cart before proceeding to Razorpay checkout.",
    path: "/cart",
  });
}

export default async function CartPage() {
  const catalog = await getCatalogProducts();

  return (
    <div>
      <StorefrontNavbar />
      <PageHero eyebrow="Checkout" title="Cart" description="Create a real pending order in Supabase, then launch Razorpay checkout and sync the payment result back to admin." />
      <section className="brand-section">
        <div className="brand-container">
          <CartCheckout products={catalog.data} razorpayKeyId={process.env.RAZORPAY_KEY_ID} />
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
