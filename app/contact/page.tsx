import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { StorefrontFooter, StorefrontNavbar } from "@/components/site/storefront-chrome";
import { getCatalogPageBySlug } from "@/lib/catalog";
import { buildStorefrontMetadata } from "@/lib/seo";
import { getStorefrontSettings } from "@/lib/storefront";

export const dynamic = "force-dynamic";

function findSectionParagraph(body: unknown, sectionId: string) {
  if (!Array.isArray(body)) return "";
  const block = body.find(
    (item) =>
      item &&
      typeof item === "object" &&
      "type" in item &&
      item.type === "paragraph" &&
      "sectionId" in item &&
      item.sectionId === sectionId &&
      "content" in item &&
      typeof item.content === "string",
  );
  return block && typeof block.content === "string" ? block.content : "";
}

function formatWhatsAppLabel(link: string) {
  const digits = link.replace(/\D/g, "");
  if (!digits) return "Message us on WhatsApp";
  return `+${digits}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const result = await getCatalogPageBySlug("contact");
  const page = result.data;

  return buildStorefrontMetadata({
    title: page?.seoTitle || "Contact Sofi Knots",
    description:
      page?.seoDescription || "Contact Sofi Knots for product questions, custom orders, gifting requests, or support.",
    path: "/contact",
    keywords: page?.seoKeywords || ["contact sofi knots", "custom macrame order", "support handmade store"],
  });
}

export default async function ContactPage() {
  const [pageResult, settings] = await Promise.all([getCatalogPageBySlug("contact"), getStorefrontSettings()]);
  const page = pageResult.data;

  const title = page?.title || "Contact Us";
  const description =
    page?.excerpt ||
    "We'd love to hear from you. Whether it's a custom order, a question, or just to say hello.";
  const supportBody =
    findSectionParagraph(page?.body, "contact-support") ||
    settings.contactMessage ||
    "Reach out for custom orders, product questions, gifting requests, and support.";
  const locationLine = settings.footerBrandText || "Artisan studio details managed from admin settings.";
  const whatsappLink = settings.whatsappLink;
  const instagramLink = settings.socialLinks.instagram;
  const facebookLink = settings.socialLinks.facebook;

  return (
    <div className="bg-[#fcfaf6] text-brand-brown">
      <StorefrontNavbar />

      <section className="border-b border-brand-sand/25 bg-[#f6f0e4]">
        <div className="brand-container py-20 text-center sm:py-24 lg:py-28">
          <p className="brand-label mb-5">Get in touch</p>
          <h1 className="mx-auto max-w-3xl font-serif text-[clamp(2.75rem,7vw,4.8rem)] leading-[0.98] tracking-[-0.04em] text-brand-brown">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-brand-taupe sm:text-base">{description}</p>
        </div>
      </section>

      <section className="brand-section bg-[#fcfaf6]">
        <div className="brand-container grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-brand-sand/30 bg-white/70 p-7 shadow-[0_18px_50px_rgba(78,59,41,0.06)] sm:p-9">
            <form className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="brand-label mb-3 block text-[11px]">Name</span>
                  <input className="brand-input h-12" placeholder="Your name" />
                </label>
                <label className="block">
                  <span className="brand-label mb-3 block text-[11px]">Email</span>
                  <input className="brand-input h-12" type="email" placeholder="you@example.com" />
                </label>
              </div>

              <label className="block">
                <span className="brand-label mb-3 block text-[11px]">Subject</span>
                <input className="brand-input h-12" placeholder="How can we help?" />
              </label>

              <label className="block">
                <span className="brand-label mb-3 block text-[11px]">Message</span>
                <textarea className="brand-input min-h-[180px]" placeholder="Tell us about your order, question, or request." />
              </label>

              <button type="submit" className="brand-btn-primary min-w-[170px] justify-center px-8 py-3">
                Send Message
              </button>
            </form>
          </div>

          <aside className="rounded-[28px] border border-brand-sand/25 bg-[#f8f3ea] p-7 sm:p-9">
            <div>
              <p className="brand-label mb-4">Visit Our Studio</p>
              <h2 className="font-serif text-[clamp(1.9rem,3vw,2.6rem)] leading-tight text-brand-brown">Let's start a conversation</h2>
              <p className="mt-4 text-sm leading-7 text-brand-taupe">{supportBody}</p>
            </div>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-brand-gold" />
                <div className="text-sm leading-7 text-brand-warm">
                  <p>{settings.siteName}</p>
                  <p>{locationLine}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-brand-gold" />
                <div className="text-sm leading-7 text-brand-warm">
                  <p>{settings.supportPhone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-4 w-4 text-brand-gold" />
                <div className="text-sm leading-7 text-brand-warm">
                  <p>{settings.supportEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 className="mt-1 h-4 w-4 text-brand-gold" />
                <div className="text-sm leading-7 text-brand-warm">
                  <p>{settings.shipping.deliveryTimeline || "Mon - Fri: 10am - 6pm"}</p>
                  <p>Fast replies for custom and gifting inquiries.</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <p className="font-serif text-2xl text-brand-brown">Follow Along</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {instagramLink ? (
                  <Link
                    href={instagramLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 w-11 items-center justify-center border border-brand-sand/45 bg-white text-brand-taupe transition hover:border-brand-gold hover:text-brand-brown"
                    aria-label="Instagram"
                  >
                    <Instagram size={16} />
                  </Link>
                ) : null}
                {facebookLink ? (
                  <Link
                    href={facebookLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 w-11 items-center justify-center border border-brand-sand/45 bg-white text-brand-taupe transition hover:border-brand-gold hover:text-brand-brown"
                    aria-label="Facebook"
                  >
                    <span className="text-sm font-medium">f</span>
                  </Link>
                ) : null}
                {whatsappLink ? (
                  <Link
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 w-11 items-center justify-center border border-brand-sand/45 bg-white text-brand-taupe transition hover:border-brand-gold hover:text-brand-brown"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </Link>
                ) : null}
              </div>
              {whatsappLink ? (
                <p className="mt-4 text-sm leading-7 text-brand-taupe">{formatWhatsAppLabel(whatsappLink)}</p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <StorefrontFooter />
    </div>
  );
}
