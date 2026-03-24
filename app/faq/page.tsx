import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getManagedPageMetadata } from "@/lib/managed-pages";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { getActiveFaqs } from "@/lib/faqs";

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
  const [pageResult, faqs] = await Promise.all([getCatalogPageBySlug("faq"), getActiveFaqs()]);
  const page = pageResult.data;
  const groupedFaqs = faqs.reduce<Record<string, typeof faqs>>((groups, item) => {
    const key = item.category || "General";
    groups[key] ||= [];
    groups[key].push(item);
    return groups;
  }, {});

  return (
    <div>
      <StorefrontNavbar />
      <PageHero
        eyebrow={fallback.eyebrow}
        title={page?.title || fallback.heroTitle}
        description={page?.excerpt || fallback.heroDescription}
      />
      <section className="brand-section">
        <div className="brand-container max-w-4xl space-y-10">
          {Object.keys(groupedFaqs).length ? (
            Object.entries(groupedFaqs).map(([category, entries]) => (
              <div key={category} className="space-y-4">
                <div className="text-xs uppercase tracking-[0.24em] text-brand-taupe">{category}</div>
                <div className="space-y-4">
                  {entries
                    .sort((left, right) => left.displayOrder - right.displayOrder)
                    .map((item) => (
                      <div key={item.id} className="rounded-[24px] border border-brand-sand/40 bg-white p-6">
                        <h2 className="font-serif text-2xl text-brand-brown">{item.question}</h2>
                        <p className="mt-3 text-sm leading-7 text-brand-warm">{item.answer}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            fallback.body
          )}
        </div>
      </section>
      <StorefrontFooter />
    </div>
  );
}
