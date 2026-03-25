"use client";

import { useMemo, useState } from "react";
import type { ProductImageRecord } from "@/lib/admin-data";

type ProductGalleryProps = {
  productName: string;
  featuredImageUrl?: string | null;
  images: ProductImageRecord[];
};

export function ProductGallery({ productName, featuredImageUrl, images }: ProductGalleryProps) {
  const gallery = useMemo(() => {
    const seen = new Set<string>();
    const merged = [
      ...(featuredImageUrl ? [{ id: "featured", productId: "", imageUrl: featuredImageUrl, altText: productName, sortOrder: -1 }] : []),
      ...images,
    ].filter((image) => {
      if (!image.imageUrl || seen.has(image.imageUrl)) return false;
      seen.add(image.imageUrl);
      return true;
    });

    return merged;
  }, [featuredImageUrl, images, productName]);

  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(gallery[0]?.imageUrl ?? null);
  const activeImage = gallery.find((image) => image.imageUrl === activeImageUrl) ?? gallery[0] ?? null;

  if (!activeImage) {
    return (
      <div className="flex aspect-[4/5] h-full w-full items-center justify-center bg-[linear-gradient(135deg,#efe3d2_0%,#dcc6ad_100%)] p-8 text-center">
        <div>
          <p className="brand-label mb-3">Media needed</p>
          <p className="max-w-sm font-serif text-3xl leading-tight text-brand-brown">
            Add a featured product image from the Products admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-brand-cream">
        <img
          src={activeImage.imageUrl}
          alt={activeImage.altText || productName}
          className="h-full w-full object-cover"
        />
      </div>
      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((image, index) => {
            const isActive = image.imageUrl === activeImage.imageUrl;
            return (
              <button
                key={image.id || `${image.imageUrl}-${index}`}
                type="button"
                onClick={() => setActiveImageUrl(image.imageUrl)}
                className={`overflow-hidden rounded-sm border transition ${
                  isActive
                    ? "border-brand-brown shadow-[0_8px_20px_rgba(49,36,23,0.12)]"
                    : "border-brand-sand/40 hover:border-brand-brown/60"
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={image.altText || `${productName} ${index + 1}`}
                  className="aspect-[4/5] h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
