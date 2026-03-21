import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Read the Sofi Knots privacy policy covering data collection, orders, and customer communication.",
  path: "/privacy",
  keywords: ["privacy policy ecommerce", "customer data policy", "sofi knots privacy"],
});

export default function PrivacyPage() {
  return (
    <div>
      <Navbar />
      <PageHero eyebrow="Policy" title="Privacy Policy" description="This page will later be editable from the admin content system." />
      <section className="brand-section">
        <div className="brand-container max-w-3xl text-sm leading-relaxed text-brand-warm">
          We collect customer information needed to fulfill orders, communicate updates, and improve the shopping experience.
        </div>
      </section>
      <Footer />
    </div>
  );
}
