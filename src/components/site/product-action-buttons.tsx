"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { trackAnalyticsEvent } from "@/lib/analytics";

type Props = {
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
};

export function ProductActionButtons({ productId, productSlug, productName, category }: Props) {
  const router = useRouter();
  const { addItem, replaceWithSingleItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="brand-btn-primary"
        onClick={() => {
          addItem(productId, 1);
          setMessage("Added to cart.");
          void trackAnalyticsEvent({
            eventName: "add_to_cart_intent",
            path: `/product/${productSlug}`,
            metadata: {
              productId,
              productSlug,
              productName,
              source: "product_detail",
              category,
            },
          });
        }}
      >
        Add to Cart
      </button>
      <button
        type="button"
        className="brand-btn-outline"
        onClick={() => {
          replaceWithSingleItem(productId, 1);
          void trackAnalyticsEvent({
            eventName: "buy_now_intent",
            path: `/product/${productSlug}`,
            metadata: {
              productId,
              productSlug,
              productName,
              source: "product_detail",
              category,
            },
          });
          router.push("/cart?checkout=1");
        }}
      >
        Buy It Now
      </button>
      </div>
      {message ? <p className="mt-3 text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
