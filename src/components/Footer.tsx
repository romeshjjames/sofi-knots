import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-cream border-t border-brand-sand/40">
      <div className="brand-container py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-semibold text-brand-brown mb-4">
              Sofi <span className="text-brand-gold">Knots</span>
            </h3>
            <p className="text-sm text-brand-warm leading-relaxed mb-6">
              Handcrafted macrame art made with love, patience, and premium natural materials. Each piece tells a story of artisan craftsmanship.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-brand-sand flex items-center justify-center text-brand-warm hover:bg-brand-gold hover:text-brand-ivory hover:border-transparent transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="brand-label mb-5">Quick Links</h4>
            {[
              { label: "Shop All", path: "/shop" },
              { label: "Collections", path: "/collections" },
              { label: "About Us", path: "/about" },
              { label: "Blog", path: "/blog" },
              { label: "Contact", path: "/contact" },
            ].map((l) => (
              <Link key={l.path} to={l.path} className="block text-sm text-brand-warm hover:text-brand-gold transition-colors mb-2.5">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Help */}
          <div>
            <h4 className="brand-label mb-5">Help</h4>
            {[
              { label: "FAQ", path: "/faq" },
              { label: "Shipping & Returns", path: "/shipping" },
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Terms & Conditions", path: "/terms" },
            ].map((l) => (
              <Link key={l.path} to={l.path} className="block text-sm text-brand-warm hover:text-brand-gold transition-colors mb-2.5">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 className="brand-label mb-5">Get in Touch</h4>
            <div className="flex items-center gap-2 text-sm text-brand-warm mb-3">
              <Mail size={14} className="text-brand-gold" />
              hello@sofiknots.com
            </div>
            <div className="flex items-center gap-2 text-sm text-brand-warm mb-6">
              <Phone size={14} className="text-brand-gold" />
              +91 98765 43210
            </div>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="brand-btn-outline text-xs py-2 px-5"
            >
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="border-t border-brand-sand/40 mt-12 pt-8 text-center">
          <p className="text-xs text-brand-taupe tracking-wide">
            © {new Date().getFullYear()} Sofi Knots. All rights reserved. Handcrafted with ♡
          </p>
        </div>
      </div>
    </footer>
  );
}
