"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { Product } from "@/types/commerce";

type Props = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: Props) {
  return (
    <div className="brand-card group animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      <Link
        href={`/product/${product.slug}`}
        className="block"
        onClick={() =>
          void trackAnalyticsEvent({
            eventName: "product_click",
            path: `/product/${product.slug}`,
            metadata: {
              productId: product.id,
              productSlug: product.slug,
              productName: product.name,
              source: "product_card_media",
              category: product.category,
            },
          })
        }
        >
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream">
          {product.featuredImageUrl ? (
            <img
              src={product.featuredImageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#efe3d2_0%,#dcc6ad_100%)] p-6 text-center">
              <div>
                <p className="brand-label mb-3">Media needed</p>
                <p className="font-serif text-2xl leading-tight text-brand-brown">{product.name}</p>
              </div>
            </div>
          )}
          {product.badge ? (
            <span className="brand-label absolute left-3 top-3 bg-brand-ivory/90 px-3 py-1 text-[10px] backdrop-blur-sm">
              {product.badge}
            </span>
          ) : null}
          <div className="absolute inset-0 flex items-end justify-center bg-foreground/0 pb-4 opacity-0 transition-all duration-500 group-hover:bg-foreground/10 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ivory/90 text-brand-warm shadow-sm backdrop-blur-sm transition-colors hover:text-brand-rose"
                aria-label="Add to wishlist"
              >
                <Heart size={16} />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-ivory/90 text-brand-warm shadow-sm backdrop-blur-sm transition-colors hover:text-brand-gold"
                aria-label="Add to cart"
                onClick={() =>
                  void trackAnalyticsEvent({
                    eventName: "add_to_cart_intent",
                    metadata: {
                      productId: product.id,
                      productSlug: product.slug,
                      productName: product.name,
                      source: "product_card_quick_action",
                      category: product.category,
                    },
                  })
                }
              >
                <ShoppingBag size={16} />
              </button>
            </div>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <p className="brand-label mb-1 text-[10px]">{product.category}</p>
        <Link
          href={`/product/${product.slug}`}
          onClick={() =>
            void trackAnalyticsEvent({
              eventName: "product_click",
              path: `/product/${product.slug}`,
              metadata: {
                productId: product.id,
                productSlug: product.slug,
                productName: product.name,
                source: "product_card_title",
                category: product.category,
              },
            })
          }
        >
          <h3 className="font-serif text-lg text-brand-brown transition-colors group-hover:text-brand-gold">{product.name}</h3>
        </Link>
        <div className="mb-2 mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Star
              key={starIndex}
              size={12}
              className={starIndex < Math.floor(product.rating) ? "fill-brand-gold text-brand-gold" : "text-brand-sand"}
            />
          ))}
          <span className="ml-1 text-xs text-brand-taupe">{product.rating}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-brand-brown">Rs. {product.price.toLocaleString("en-IN")}</span>
          {product.originalPrice ? (
            <span className="text-xs text-brand-taupe line-through">Rs. {product.originalPrice.toLocaleString("en-IN")}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
