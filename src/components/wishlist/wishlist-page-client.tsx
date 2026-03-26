"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { trackAnalyticsEvent } from "@/lib/analytics";

type WishlistProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  featuredImageUrl?: string | null;
};

export function WishlistPageClient({ products }: { products: WishlistProduct[] }) {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const savedProducts = items
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is WishlistProduct => Boolean(product));

  return (
    <section className="brand-section">
      <div className="brand-container">
        {savedProducts.length ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-brand-sand/35 bg-brand-cream px-6 py-5">
              <div>
                <p className="brand-label mb-2">Saved products</p>
                <p className="text-sm text-brand-warm">{savedProducts.length} item{savedProducts.length === 1 ? "" : "s"} saved for later.</p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-warm transition hover:text-brand-gold"
                onClick={() => clearWishlist()}
              >
                <Trash2 size={16} />
                Clear wishlist
              </button>
            </div>

            <div className="grid gap-5">
              {savedProducts.map((product) => {
                const hasComparePrice = typeof product.originalPrice === "number" && product.originalPrice > product.price;

                return (
                  <article key={product.id} className="grid gap-5 rounded-sm border border-brand-sand/35 bg-white p-5 md:grid-cols-[180px_1fr_auto] md:items-center">
                    <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-sm bg-brand-cream">
                      {product.featuredImageUrl ? (
                        <img src={product.featuredImageUrl} alt={product.name} className="aspect-[4/5] h-full w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[4/5] h-full w-full items-center justify-center text-center text-[10px] uppercase tracking-[0.2em] text-brand-taupe">
                          No image
                        </div>
                      )}
                    </Link>
                    <div>
                      <p className="brand-label mb-2">{product.category}</p>
                      <Link href={`/product/${product.slug}`} className="font-serif text-3xl text-brand-brown transition-colors hover:text-brand-gold">
                        {product.name}
                      </Link>
                      <div className="mt-4 flex items-center gap-3">
                        <span className="text-xl font-medium text-brand-brown">Rs. {product.price.toLocaleString("en-IN")}</span>
                        {hasComparePrice ? (
                          <span className="text-sm text-brand-taupe line-through">Rs. {product.originalPrice!.toLocaleString("en-IN")}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        className="brand-btn-primary"
                        onClick={() => {
                          addItem(product.id, 1);
                          void trackAnalyticsEvent({
                            eventName: "add_to_cart_intent",
                            path: `/product/${product.slug}`,
                            metadata: {
                              productId: product.id,
                              productName: product.name,
                              source: "wishlist_page",
                              category: product.category,
                            },
                          });
                        }}
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#f0d4d4] px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                        onClick={() => {
                          removeItem(product.id);
                          void trackAnalyticsEvent({
                            eventName: "wishlist_remove",
                            path: `/product/${product.slug}`,
                            metadata: {
                              productId: product.id,
                              productName: product.name,
                              source: "wishlist_page",
                              category: product.category,
                            },
                          });
                        }}
                      >
                        <Heart size={16} className="fill-current" />
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-brand-sand/35 bg-brand-cream px-6 py-14 text-center">
            <p className="brand-label mb-3">Wishlist</p>
            <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] text-brand-brown">Your saved pieces will appear here</h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-brand-warm">
              Tap the heart icon on any product card to save handcrafted pieces for later.
            </p>
            <Link href="/collections" className="brand-btn-primary mt-8 inline-flex">
              Explore Collections
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
