import type { Metadata } from "next";
import { getManagedPageMetadata, renderManagedPage } from "@/lib/managed-pages";

const fallback = {
  title: "Privacy Policy",
  description: "Read the Sofi Knots privacy policy covering data collection, orders, and customer communication.",
  path: "/privacy",
  keywords: ["privacy policy ecommerce", "customer data policy", "sofi knots privacy"],
  eyebrow: "Policy",
  heroTitle: "Privacy Policy",
  heroDescription: "This page is now ready to be managed from the admin content system.",
  body: (
    <section className="brand-section">
      <div className="brand-container max-w-3xl text-sm leading-relaxed text-brand-warm">
        We collect customer information needed to fulfill orders, communicate updates, and improve the shopping experience.
      </div>
    </section>
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  return getManagedPageMetadata("privacy", fallback);
}

export default async function PrivacyPage() {
  return renderManagedPage("privacy", fallback);
}
