"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { CustomOrderModal } from "@/components/site/custom-order-modal";
import { trackAnalyticsEvent } from "@/lib/analytics";

type Props = {
  productId: string;
  productSlug: string;
  productName: string;
  category: string;
  productImageUrl?: string | null;
};

export function ProductActionButtons({ productId, productSlug, productName, category, productImageUrl }: Props) {
  const router = useRouter();
  const { addItem, replaceWithSingleItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [customOrderOpen, setCustomOrderOpen] = useState(false);

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
      <button
        type="button"
        className="rounded-2xl border border-[#d8ba84] bg-[linear-gradient(135deg,#f7ead2_0%,#fff8ec_100%)] px-6 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[#9a6b2c] shadow-[0_12px_28px_rgba(199,160,90,0.14)] transition hover:scale-[1.02] hover:shadow-[0_18px_32px_rgba(199,160,90,0.24)]"
        onClick={() => setCustomOrderOpen(true)}
      >
        Custom Order
      </button>
      </div>
      {message ? <p className="mt-3 text-sm text-brand-warm">{message}</p> : null}
      <CustomOrderModal
        open={customOrderOpen}
        onClose={() => setCustomOrderOpen(false)}
        productId={productId}
        productName={productName}
        productImageUrl={productImageUrl}
      />
    </div>
  );
}
