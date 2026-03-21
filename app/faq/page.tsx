import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description: "Find answers about handmade production timelines, shipping, customization, and order support for Sofi Knots.",
  path: "/faq",
  keywords: ["sofi knots faq", "shipping and returns faq", "custom handmade order faq"],
});

export default function FaqPage() {
  const faqs = [
    ["Are all products handmade?", "Yes. Each Sofi Knots piece is designed as a handcrafted product line."],
    ["Can customers request custom orders?", "Yes. The future admin workflow can support inquiry-based custom requests."],
    ["How will stock be managed?", "Product variants and inventory counts will be managed from the admin panel."],
  ];

  return (
    <div>
      <Navbar />
      <PageHero
        eyebrow="Support"
        title="FAQ Content That Builds Trust"
        description="FAQ pages help conversions and can support search visibility when the questions match real customer intent."
      />
      <section className="brand-section">
        <div className="brand-container max-w-3xl space-y-4">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-sm border border-brand-sand/40 p-6">
              <h2 className="mb-2 font-serif text-2xl text-brand-brown">{question}</h2>
              <p className="text-sm leading-relaxed text-brand-warm">{answer}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
