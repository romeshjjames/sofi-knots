import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-brand-sand/40 bg-brand-cream">
      <div className="brand-container py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <h3 className="mb-4 font-serif text-2xl font-semibold text-brand-brown">
              Sofi <span className="text-brand-gold">Knots</span>
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-brand-warm">
              Handcrafted macrame art made with love, patience, and premium natural materials. Each piece tells a story of artisan craftsmanship.
            </p>
            <div className="flex gap-3">
              <a
                href={siteConfig.social.instagram}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-sand text-brand-warm transition-all duration-300 hover:border-transparent hover:bg-brand-gold hover:text-brand-ivory"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href={siteConfig.social.facebook}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-sand text-brand-warm transition-all duration-300 hover:border-transparent hover:bg-brand-gold hover:text-brand-ivory"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-sand text-brand-warm transition-all duration-300 hover:border-transparent hover:bg-brand-gold hover:text-brand-ivory"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="brand-label mb-5">Quick Links</h4>
            {[
              { label: "Shop All", path: "/shop" },
              { label: "Collections", path: "/collections" },
              { label: "About Us", path: "/about" },
              { label: "Blog", path: "/blog" },
              { label: "Contact", path: "/contact" },
            ].map((link) => (
              <Link key={link.path} href={link.path} className="mb-2.5 block text-sm text-brand-warm transition-colors hover:text-brand-gold">
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="brand-label mb-5">Help</h4>
            {[
              { label: "FAQ", path: "/faq" },
              { label: "Shipping & Returns", path: "/shipping" },
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Terms & Conditions", path: "/terms" },
            ].map((link) => (
              <Link key={link.path} href={link.path} className="mb-2.5 block text-sm text-brand-warm transition-colors hover:text-brand-gold">
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="brand-label mb-5">Get in Touch</h4>
            <div className="mb-3 flex items-center gap-2 text-sm text-brand-warm">
              <Mail size={14} className="text-brand-gold" />
              {siteConfig.contactEmail}
            </div>
            <div className="mb-6 flex items-center gap-2 text-sm text-brand-warm">
              <Phone size={14} className="text-brand-gold" />
              {siteConfig.contactPhone}
            </div>
            <a
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="brand-btn-outline px-5 py-2 text-xs"
            >
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-sand/40 pt-8 text-center">
          <p className="text-xs tracking-wide text-brand-taupe">
            Copyright {new Date().getFullYear()} Sofi Knots. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
