import type { Metadata } from "next";
import { getManagedPageMetadata, renderManagedPage } from "@/lib/managed-pages";

const fallback = {
  title: "Frequently Asked Questions",
  description: "Find answers about handmade production timelines, shipping, customization, and order support for Sofi Knots.",
  path: "/faq",
  keywords: ["sofi knots faq", "shipping and returns faq", "custom handmade order faq"],
  eyebrow: "Support",
  heroTitle: "FAQ Content That Builds Trust",
  heroDescription: "FAQ pages help conversions and can support search visibility when the questions match real customer intent.",
  body: (
    <section className="brand-section">
      <div className="brand-container max-w-3xl space-y-4">
        {[
          ["Are all products handmade?", "Yes. Each Sofi Knots piece is designed as a handcrafted product line."],
          ["Can customers request custom orders?", "Yes. The future admin workflow can support inquiry-based custom requests."],
          ["How will stock be managed?", "Product variants and inventory counts will be managed from the admin panel."],
        ].map(([question, answer]) => (
          <div key={question} className="rounded-sm border border-brand-sand/40 p-6">
            <h2 className="mb-2 font-serif text-2xl text-brand-brown">{question}</h2>
            <p className="text-sm leading-relaxed text-brand-warm">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  return getManagedPageMetadata("faq", fallback);
}

export default async function FaqPage() {
  return renderManagedPage("faq", fallback);
}
