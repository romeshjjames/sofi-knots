import type { Metadata } from "next";
import { CustomerLoginPanel } from "@/components/customer/customer-login-panel";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { buildStorefrontMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildStorefrontMetadata({
    title: "Customer Login",
    description: "Login or create your Sofi Knots customer account while guest checkout remains available.",
    path: "/account/login",
  });
}

export default function CustomerLoginPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  return (
    <div>
      <StorefrontNavbar />
      <PageHero
        eyebrow="Customer account"
        title="Login or create your account"
        description="Save your details for faster checkout, view order history, or continue as a guest whenever you prefer."
      />
      <section className="brand-section">
        <div className="brand-container">
          <CustomerLoginPanel next={searchParams?.next} />
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
