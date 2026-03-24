"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type NavbarProps = {
  siteName?: string;
};

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Collections", path: "/collections" },
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export function Navbar({ siteName = "Sofi Knots" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-sand/40 bg-brand-ivory/95 backdrop-blur-sm">
      <div className="brand-container flex h-16 items-center justify-between lg:h-20">
        <button
          onClick={() => setOpen((value) => !value)}
          className="p-2 text-brand-brown transition-colors hover:text-brand-gold lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
          <span className="font-serif text-2xl font-semibold tracking-tight text-brand-brown lg:text-3xl">
            {siteName}
          </span>
        </Link>

        <nav className="ml-16 hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-200 hover:text-brand-gold ${
                  isActive ? "text-brand-gold" : "text-brand-warm"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/shop" className="p-2 text-brand-warm transition-colors hover:text-brand-gold" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link href="/wishlist" className="p-2 text-brand-warm transition-colors hover:text-brand-gold" aria-label="Wishlist">
            <Heart size={20} />
          </Link>
          <Link href="/cart" className="p-2 text-brand-warm transition-colors hover:text-brand-gold" aria-label="Cart">
            <span className="relative block">
              <ShoppingBag size={20} />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-brown px-1.5 text-[10px] font-medium leading-none text-white">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </span>
          </Link>
        </div>
      </div>

      {open ? (
        <nav className="animate-fade-in border-t border-brand-sand/40 bg-brand-ivory lg:hidden">
          <div className="brand-container flex flex-col gap-4 py-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setOpen(false)}
                  className={`py-1 text-sm font-medium uppercase tracking-[0.12em] transition-colors ${
                    isActive ? "text-brand-gold" : "text-brand-warm"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-3 border-t border-brand-sand/40 pt-4">
              <Link href="/faq" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">
                FAQ
              </Link>
              <Link href="/shipping" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">
                Shipping & Returns
              </Link>
              <Link href="/admin" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">
                Admin Panel
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
