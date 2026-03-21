"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { GripVertical, Sparkles } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { Product } from "@/types/commerce";

type Props = {
  products: Product[];
  initialProductIds: string[];
  updatedAt: string | null;
};

function orderFeaturedProducts(products: Product[], orderedIds: string[]) {
  const featuredProducts = products.filter((product) => product.isFeatured);
  const orderMap = new Map(orderedIds.map((id, index) => [id, index]));

  return [...featuredProducts].sort((left, right) => {
    const leftIndex = orderMap.get(left.id);
    const rightIndex = orderMap.get(right.id);

    if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
    if (leftIndex !== undefined) return -1;
    if (rightIndex !== undefined) return 1;
    return left.name.localeCompare(right.name);
  });
}

export function FeaturedMerchandisingManager({ products, initialProductIds, updatedAt }: Props) {
  const [orderedProducts, setOrderedProducts] = useState(() => orderFeaturedProducts(products, initialProductIds));
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(updatedAt);
  const [isPending, startTransition] = useTransition();

  const featuredProducts = useMemo(() => orderFeaturedProducts(products, initialProductIds), [initialProductIds, products]);

  useEffect(() => {
    setOrderedProducts(featuredProducts);
    setSavedAt(updatedAt);
  }, [featuredProducts, updatedAt]);

  const hasUnsavedChanges = orderedProducts.map((product) => product.id).join("|") !== featuredProducts.map((product) => product.id).join("|");

  function moveProduct(fromId: string, toId: string) {
    if (fromId === toId) return;
    setOrderedProducts((current) => {
      const next = [...current];
      const fromIndex = next.findIndex((product) => product.id === fromId);
      const toIndex = next.findIndex((product) => product.id === toId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  async function saveOrder() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/merchandising/featured", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: orderedProducts.map((product) => product.id) }),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save featured lineup.");
        return;
      }

      setMessage("Featured lineup order saved.");
      setSavedAt(body.merchandising?.updatedAt ?? new Date().toISOString());
      window.location.reload();
    });
  }

  if (!orderedProducts.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-brand-sand/50 bg-[#fcfaf5] p-6 text-sm text-brand-warm">
        No featured products yet. Mark products as featured in the catalog editor first, then arrange the lineup here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-brand-brown">
            <Sparkles size={16} className="text-brand-gold" />
            Homepage featured lineup
          </div>
          <p className="mt-1 text-sm text-brand-warm">
            Drag products into the order you want on featured storefront surfaces. This order now persists instead of relying on fallback sorting.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          {savedAt ? <AdminBadge tone="info">Saved {new Date(savedAt).toLocaleString("en-IN")}</AdminBadge> : <AdminBadge tone="warning">Not saved yet</AdminBadge>}
          <button type="button" className="brand-btn-primary px-5 py-3" disabled={isPending || !hasUnsavedChanges} onClick={() => void saveOrder()}>
            {isPending ? "Saving..." : "Save lineup order"}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {orderedProducts.map((product, index) => (
          <div
            key={product.id}
            draggable
            onDragStart={() => setDraggedId(product.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId) moveProduct(draggedId, product.id);
              setDraggedId(null);
            }}
            className={`grid gap-4 rounded-[24px] border p-4 transition md:grid-cols-[auto_minmax(0,1fr)_auto] ${
              draggedId === product.id ? "border-brand-gold bg-white shadow-[0_18px_40px_rgba(65,42,17,0.08)]" : "border-brand-sand/40 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-2xl border border-brand-sand/50 bg-[#fcfaf5] p-3 text-brand-warm"
                onMouseDown={(event) => event.preventDefault()}
                aria-label={`Reorder ${product.name}`}
              >
                <GripVertical size={16} />
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-brown text-sm font-medium text-white">
                {index + 1}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-medium text-brand-brown">{product.name}</p>
                <AdminBadge tone="success">Featured</AdminBadge>
                {product.badge ? <AdminBadge tone="default">{product.badge}</AdminBadge> : null}
              </div>
              <p className="mt-1 text-sm text-brand-warm">{product.shortDescription}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-brand-taupe">
                <span>{product.category}</span>
                <span>Rs. {product.price.toLocaleString("en-IN")}</span>
                <span>{product.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              {product.featuredImageUrl ? (
                <img src={product.featuredImageUrl} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-cream text-[10px] uppercase tracking-[0.16em] text-brand-taupe">
                  No image
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
