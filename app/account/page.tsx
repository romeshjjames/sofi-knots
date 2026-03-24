import type { Metadata } from "next";
import { CustomerAccountPanel } from "@/components/customer/customer-account-panel";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { buildStorefrontMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildStorefrontMetadata({
    title: "My Account",
    description: "View your Sofi Knots customer profile, past orders, and account details.",
    path: "/account",
  });
}

export default function CustomerAccountPage() {
  return (
    <div>
      <StorefrontNavbar />
      <PageHero eyebrow="Customer account" title="My Account" description="Your profile, order history, and a faster checkout experience in one place." />
      <section className="brand-section">
        <div className="brand-container">
          <CustomerAccountPanel />
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
