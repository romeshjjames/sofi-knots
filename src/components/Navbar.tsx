import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Heart, Menu, X, Search } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Collections", path: "/collections" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-brand-ivory/95 backdrop-blur-sm border-b border-brand-sand/40">
      <div className="brand-container flex items-center justify-between h-16 lg:h-20">
        {/* Mobile menu btn */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 -ml-2 text-brand-brown transition-colors hover:text-brand-gold"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <h1 className="font-serif text-2xl lg:text-3xl font-semibold tracking-tight text-brand-brown">
            Sofi <span className="text-brand-gold">Knots</span>
          </h1>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 ml-16">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-200 hover:text-brand-gold ${
                location.pathname === l.path ? "text-brand-gold" : "text-brand-warm"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <Link to="/shop" className="p-2 text-brand-warm hover:text-brand-gold transition-colors" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link to="/wishlist" className="p-2 text-brand-warm hover:text-brand-gold transition-colors" aria-label="Wishlist">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="p-2 text-brand-warm hover:text-brand-gold transition-colors" aria-label="Cart">
            <ShoppingBag size={20} />
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="lg:hidden border-t border-brand-sand/40 bg-brand-ivory animate-fade-in">
          <div className="brand-container py-6 flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium uppercase tracking-[0.12em] py-1 transition-colors ${
                  location.pathname === l.path ? "text-brand-gold" : "text-brand-warm"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-brand-sand/40 pt-4 flex flex-col gap-3">
              <Link to="/faq" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">FAQ</Link>
              <Link to="/shipping" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">Shipping & Returns</Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
