import type { Metadata } from "next";
import { getManagedPageMetadata, renderManagedPage } from "@/lib/managed-pages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const fallback = {
  title: "Privacy Policy",
  description: "Read the Sofi Knots privacy policy covering data collection, orders, and customer communication.",
  path: "/privacy",
  keywords: ["privacy policy ecommerce", "customer data policy", "sofi knots privacy"],
  eyebrow: "Policy",
  heroTitle: "Privacy Policy",
  heroDescription: "This page is now ready to be managed from the admin content system.",
  body: (settings) => (
    <section className="brand-section">
      <div className="brand-container max-w-3xl text-sm leading-relaxed text-brand-warm">
        {settings.policies.privacyPolicy ||
          "We collect customer information needed to fulfill orders, communicate updates, and improve the shopping experience."}
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
