import type { Metadata } from "next";
import { CartCheckout } from "@/components/checkout/cart-checkout";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { getCatalogProducts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Your Cart",
  description: "Review products in your Sofi Knots cart before proceeding to Razorpay checkout.",
  path: "/cart",
});

export default async function CartPage() {
  const catalog = await getCatalogProducts();

  return (
    <div>
      <Navbar />
      <PageHero eyebrow="Checkout" title="Cart" description="Create a real pending order in Supabase, then launch Razorpay checkout and sync the payment result back to admin." />
      <section className="brand-section">
        <div className="brand-container">
          <CartCheckout products={catalog.data} razorpayKeyId={process.env.RAZORPAY_KEY_ID} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
