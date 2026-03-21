"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ProductVariantRecord } from "@/lib/admin-data";

type Props = {
  productId: string;
  basePrice: number;
};

const blankVariant = (basePrice: number) => ({
  title: "",
  sku: "",
  priceInr: basePrice,
  compareAtPriceInr: 0,
  stockQuantity: 0,
  attributesText: "",
  isDefault: false,
});

export function ProductVariantsManager({ productId, basePrice }: Props) {
  const [variants, setVariants] = useState<ProductVariantRecord[]>([]);
  const [newVariant, setNewVariant] = useState(blankVariant(basePrice));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/products/${productId}/variants`)
      .then((res) => res.json())
      .then((body) => setVariants(body.variants ?? []))
      .catch(() => setVariants([]));
  }, [productId]);

  function serializeAttributes(text: string) {
    return text
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, pair) => {
        const [key, value] = pair.split(":").map((item) => item.trim());
        if (key && value) acc[key] = value;
        return acc;
      }, {});
  }

  function attributesToText(attributes: Record<string, string>) {
    return Object.entries(attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  }

  async function createVariant() {
    const response = await fetch(`/api/admin/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newVariant.title,
        sku: newVariant.sku || null,
        priceInr: Number(newVariant.priceInr),
        compareAtPriceInr: Number(newVariant.compareAtPriceInr) || null,
        stockQuantity: Number(newVariant.stockQuantity) || 0,
        attributes: serializeAttributes(newVariant.attributesText),
        isDefault: newVariant.isDefault,
      }),
    });
    const body = await response.json();
    setMessage(response.ok ? "Variant created." : body.error || "Failed to create variant.");
    if (response.ok) {
      setVariants((current) => [...current, body.variant]);
      setNewVariant(blankVariant(basePrice));
    }
  }

  async function saveVariant(variant: ProductVariantRecord) {
    const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variant),
    });
    const body = await response.json();
    setMessage(response.ok ? "Variant saved." : body.error || "Failed to save variant.");
    if (response.ok) {
      window.location.reload();
    }
  }

  async function removeVariant(variantId: string) {
    const response = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, { method: "DELETE" });
    const body = await response.json();
    setMessage(response.ok ? "Variant deleted." : body.error || "Failed to delete variant.");
    if (response.ok) {
      setVariants((current) => current.filter((variant) => variant.id !== variantId));
    }
  }

  const totalStock = variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#fcfaf5] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium text-brand-brown">Variants and inventory</h5>
            <p className="text-sm text-brand-warm">Track sellable options, pricing, and stock in one matrix.</p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Total stock</div>
            <div className="text-lg font-medium text-brand-brown">{totalStock}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {variants.map((variant) => (
          <div key={variant.id} className="rounded-2xl border border-brand-sand/40 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="brand-input"
                value={variant.title}
                onChange={(event) => setVariants((current) => current.map((entry) => (entry.id === variant.id ? { ...entry, title: event.target.value } : entry)))}
                placeholder="Variant title"
              />
              <input
                className="brand-input"
                value={variant.sku ?? ""}
                onChange={(event) => setVariants((current) => current.map((entry) => (entry.id === variant.id ? { ...entry, sku: event.target.value } : entry)))}
                placeholder="SKU"
              />
              <input
                className="brand-input"
                type="number"
                value={variant.priceInr}
                onChange={(event) => setVariants((current) => current.map((entry) => (entry.id === variant.id ? { ...entry, priceInr: Number(event.target.value) } : entry)))}
              />
              <input
                className="brand-input"
                type="number"
                value={variant.compareAtPriceInr ?? ""}
                onChange={(event) => setVariants((current) => current.map((entry) => (entry.id === variant.id ? { ...entry, compareAtPriceInr: event.target.value ? Number(event.target.value) : null } : entry)))}
                placeholder="Compare at price"
              />
              <input
                className="brand-input"
                type="number"
                value={variant.stockQuantity}
                onChange={(event) => setVariants((current) => current.map((entry) => (entry.id === variant.id ? { ...entry, stockQuantity: Number(event.target.value) } : entry)))}
                placeholder="Stock"
              />
              <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
                <input
                  type="checkbox"
                  checked={variant.isDefault}
                  onChange={(event) => setVariants((current) => current.map((entry) => ({ ...entry, isDefault: entry.id === variant.id ? event.target.checked : false })))}
                />
                Default variant
              </label>
            </div>
            <input
              className="brand-input mt-3"
              value={attributesToText(variant.attributes)}
              onChange={(event) =>
                setVariants((current) =>
                  current.map((entry) => (entry.id === variant.id ? { ...entry, attributes: serializeAttributes(event.target.value) } : entry)),
                )
              }
              placeholder="Attributes, e.g. Size: Medium, Color: Coral"
            />
            <div className="mt-3 flex gap-3">
              <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => void saveVariant(variant)}>
                Save variant
              </button>
              <button type="button" className="brand-btn-outline border-rose-300 px-4 py-2 text-rose-700 hover:bg-rose-600 hover:text-white" onClick={() => void removeVariant(variant.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-brand-sand/60 bg-[#fcfaf5] p-4">
        <h5 className="font-medium text-brand-brown">Add variant</h5>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input className="brand-input" value={newVariant.title} onChange={(event) => setNewVariant((current) => ({ ...current, title: event.target.value }))} placeholder="Variant title" />
          <input className="brand-input" value={newVariant.sku} onChange={(event) => setNewVariant((current) => ({ ...current, sku: event.target.value }))} placeholder="SKU" />
          <input className="brand-input" type="number" value={newVariant.priceInr} onChange={(event) => setNewVariant((current) => ({ ...current, priceInr: Number(event.target.value) }))} />
          <input className="brand-input" type="number" value={newVariant.compareAtPriceInr} onChange={(event) => setNewVariant((current) => ({ ...current, compareAtPriceInr: Number(event.target.value) }))} placeholder="Compare at price" />
          <input className="brand-input" type="number" value={newVariant.stockQuantity} onChange={(event) => setNewVariant((current) => ({ ...current, stockQuantity: Number(event.target.value) }))} placeholder="Stock" />
          <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
            <input type="checkbox" checked={newVariant.isDefault} onChange={(event) => setNewVariant((current) => ({ ...current, isDefault: event.target.checked }))} />
            Set as default
          </label>
        </div>
        <input className="brand-input mt-3" value={newVariant.attributesText} onChange={(event) => setNewVariant((current) => ({ ...current, attributesText: event.target.value }))} placeholder="Attributes, e.g. Size: Medium, Color: Coral" />
        <button type="button" className="brand-btn-primary mt-3 justify-center gap-2 px-4 py-2" onClick={() => void createVariant()}>
          <Plus size={16} />
          Add variant
        </button>
      </div>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
