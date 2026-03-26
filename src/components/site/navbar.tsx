"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { useCustomerAuth } from "@/components/customer/customer-auth-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

type CollectionNavItem = {
  title: string;
  slug: string;
};

type NavbarProps = {
  siteName?: string;
  logoUrl?: string | null;
  collections?: CollectionNavItem[];
};

const navLinks = [
  { label: "About", path: "/about" },
  { label: "Blog", path: "/blog" },
  { label: "Contact", path: "/contact" },
];

export function Navbar({ siteName = "Sofi Knots", logoUrl = null, collections = [] }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { customer, loading, logout } = useCustomerAuth();

  function handleLogout() {
    startTransition(async () => {
      await logout();
      window.location.href = "/";
    });
  }

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
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={siteName}
              className="h-12 w-auto object-contain lg:h-16"
            />
          ) : (
            <span className="font-serif text-2xl font-semibold tracking-tight text-brand-brown lg:text-3xl">
              {siteName}
            </span>
          )}
        </Link>

        <nav className="ml-16 hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            className={`text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-200 hover:text-brand-gold ${
              pathname === "/" ? "text-brand-gold" : "text-brand-warm"
            }`}
          >
            Home
          </Link>
          <div className="group relative">
            <Link
              href="/collections"
              className="rounded-full border border-[#c79a5a] bg-[#f7ecd8] px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] text-[#b7843f] transition-colors duration-200 hover:border-[#b7843f] hover:bg-[#f3e2c5]"
            >
              Collections
            </Link>
            {collections.length ? (
              <div className="pointer-events-none absolute left-1/2 top-full z-40 hidden min-w-[260px] -translate-x-1/2 pt-4 group-hover:block group-focus-within:block">
                <div className="pointer-events-auto rounded-[20px] border border-brand-sand/40 bg-brand-ivory px-4 py-4 shadow-[0_18px_40px_rgba(49,36,23,0.12)]">
                  <div className="grid gap-2">
                    {collections.map((collection) => {
                      const isItemActive = pathname === `/collections/${collection.slug}`;
                      return (
                        <Link
                          key={collection.slug}
                          href={`/collections/${collection.slug}`}
                          className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                            isItemActive
                              ? "bg-brand-cream text-brand-brown"
                              : "text-brand-warm hover:bg-brand-cream hover:text-brand-brown"
                          }`}
                        >
                          {collection.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
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
          <Link href="/collections" className="p-2 text-brand-warm transition-colors hover:text-brand-gold" aria-label="Search">
            <Search size={20} />
          </Link>
          <Link href="/wishlist" className="p-2 text-brand-warm transition-colors hover:text-brand-gold" aria-label="Wishlist">
            <span className="relative block">
              <Heart size={20} />
              {wishlistCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-brown px-1.5 text-[10px] font-medium leading-none text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              ) : null}
            </span>
          </Link>
          <Link href={customer ? "/account" : "/account/login"} className="p-2 text-brand-warm transition-colors hover:text-brand-gold" aria-label={customer ? "Account" : "Customer login"}>
            <User size={20} />
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
          {customer && !loading ? (
            <button
              type="button"
              className="hidden items-center gap-2 rounded-full border border-brand-sand/40 px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] text-brand-warm transition hover:border-brand-gold hover:text-brand-gold lg:inline-flex"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              {isPending ? "Logging out" : "Logout"}
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <nav className="animate-fade-in border-t border-brand-sand/40 bg-brand-ivory lg:hidden">
          <div className="brand-container flex flex-col gap-4 py-6">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={`py-1 text-sm font-medium uppercase tracking-[0.12em] transition-colors ${
                pathname === "/" ? "text-brand-gold" : "text-brand-warm"
              }`}
            >
              Home
            </Link>
            <Link
              href="/collections"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#c79a5a] bg-[#f7ecd8] px-4 py-2 text-sm font-medium uppercase tracking-[0.12em] text-[#b7843f] transition-colors"
            >
              Collections
            </Link>
            {collections.length ? (
              <div className="ml-4 flex flex-col gap-2 border-l border-brand-sand/40 pl-4">
                {collections.map((collection) => {
                  const isItemActive = pathname === `/collections/${collection.slug}`;
                  return (
                    <Link
                      key={collection.slug}
                      href={`/collections/${collection.slug}`}
                      onClick={() => setOpen(false)}
                      className={`text-sm transition-colors ${isItemActive ? "text-brand-gold" : "text-brand-taupe"}`}
                    >
                      {collection.title}
                    </Link>
                  );
                })}
              </div>
            ) : null}
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
              <Link href={customer ? "/account" : "/account/login"} onClick={() => setOpen(false)} className="text-sm text-brand-taupe">
                {customer ? "My Account" : "Customer Login"}
              </Link>
              <Link href="/faq" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">
                FAQ
              </Link>
              <Link href="/shipping" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">
                Shipping & Returns
              </Link>
              <Link href="/admin" onClick={() => setOpen(false)} className="text-sm text-brand-taupe">
                Admin Panel
              </Link>
              {customer ? (
                <button type="button" onClick={handleLogout} className="text-left text-sm text-brand-taupe">
                  {isPending ? "Logging out..." : "Logout"}
                </button>
              ) : null}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
