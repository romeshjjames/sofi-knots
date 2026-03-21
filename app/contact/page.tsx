import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { PageHero } from "@/components/site/page-hero";
import { siteConfig } from "@/lib/site-config";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact Sofi Knots",
  description: "Contact Sofi Knots for product questions, custom orders, gifting requests, or support.",
  path: "/contact",
  keywords: ["contact sofi knots", "custom macrame order", "support handmade store"],
});

export default function ContactPage() {
  return (
    <div>
      <Navbar />
      <PageHero
        eyebrow="Contact"
        title="Let Customers Reach You Easily"
        description="This page is important for trust, local signals, and conversions. It should always have accurate support details and a simple contact workflow."
      />
      <section className="brand-section">
        <div className="brand-container grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm bg-brand-cream p-8">
            <p className="brand-label mb-3">Support Details</p>
            <p className="mb-2 text-brand-warm">{siteConfig.contactEmail}</p>
            <p className="mb-6 text-brand-warm">{siteConfig.contactPhone}</p>
            <a href={siteConfig.social.whatsapp} target="_blank" rel="noreferrer" className="brand-btn-primary">
              Message on WhatsApp
            </a>
          </div>
          <form className="grid gap-4 rounded-sm border border-brand-sand/40 p-8">
            <input className="brand-input" placeholder="Name" />
            <input className="brand-input" placeholder="Email" type="email" />
            <input className="brand-input" placeholder="Phone" />
            <textarea className="brand-input min-h-36" placeholder="How can we help?" />
            <button type="submit" className="brand-btn-primary w-full sm:w-fit">
              Send Inquiry
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
