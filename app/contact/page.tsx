import type { Metadata } from "next";
import { getManagedPageMetadata, renderManagedPage } from "@/lib/managed-pages";

const fallback = {
  title: "Contact Sofi Knots",
  description: "Contact Sofi Knots for product questions, custom orders, gifting requests, or support.",
  path: "/contact",
  keywords: ["contact sofi knots", "custom macrame order", "support handmade store"],
  eyebrow: "Contact",
  heroTitle: "Let Customers Reach You Easily",
  heroDescription: "This page is important for trust, local signals, and conversions. It should always have accurate support details and a simple contact workflow.",
  body: (settings) => (
    <section className="brand-section">
      <div className="brand-container grid gap-8 lg:grid-cols-2">
        <div className="rounded-sm bg-brand-cream p-8">
          <p className="brand-label mb-3">Support Details</p>
          <p className="mb-4 text-sm leading-relaxed text-brand-warm">{settings.contactMessage}</p>
          <p className="mb-2 text-brand-warm">{settings.supportEmail}</p>
          <p className="mb-6 text-brand-warm">{settings.supportPhone}</p>
          <a href={settings.whatsappLink} target="_blank" rel="noreferrer" className="brand-btn-primary">
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
  ),
};

export async function generateMetadata(): Promise<Metadata> {
  return getManagedPageMetadata("contact", fallback);
}

export default async function ContactPage() {
  return renderManagedPage("contact", fallback);
}
