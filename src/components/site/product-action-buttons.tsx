"use client";

import { trackAnalyticsEvent } from "@/lib/analytics";

type Props = {
  productId: string;
  productSlug: string;
  productName: string;
};

export function ProductActionButtons({ productId, productSlug, productName }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="brand-btn-primary"
        onClick={() =>
          void trackAnalyticsEvent({
            eventName: "add_to_cart_intent",
            path: `/product/${productSlug}`,
            metadata: {
              productId,
              productSlug,
              productName,
              source: "product_detail",
            },
          })
        }
      >
        Add to Cart
      </button>
      <button
        type="button"
        className="brand-btn-outline"
        onClick={() =>
          void trackAnalyticsEvent({
            eventName: "buy_now_intent",
            path: `/product/${productSlug}`,
            metadata: {
              productId,
              productSlug,
              productName,
              source: "product_detail",
            },
          })
        }
      >
        Buy with Razorpay
      </button>
    </div>
  );
}
