"use client";

import { useState, useTransition } from "react";
import { Archive, ImagePlus, Trash2, X } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import { ProductGalleryManager } from "@/components/admin/product-gallery-manager";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import type { Product } from "@/types/commerce";

type Option = {
  id: string;
  name: string;
  slug: string;
};

const salesChannelOptions = [
  { id: "online-store", label: "Online Store" },
  { id: "instagram-shop", label: "Instagram Shop" },
  { id: "whatsapp-orders", label: "WhatsApp Orders" },
  { id: "pop-up-events", label: "Pop-up Events" },
];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getStatusTone(status?: Product["status"]) {
  if (status === "active") return "success";
  if (status === "draft") return "warning";
  if (status === "archived") return "danger";
  return "default";
}

export function ProductDetailEditor({
  initialProduct,
  categories,
  collections,
}: {
  initialProduct: Product;
  categories: Option[];
  collections: Option[];
}) {
  const [product, setProduct] = useState(initialProduct);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  function updateProduct(patch: Partial<Product>) {
    setProduct((current) => ({ ...current, ...patch }));
  }

  async function saveProduct() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          sku: product.sku || null,
          priceInr: product.price,
          originalPriceInr: product.originalPrice ?? null,
          costPerItem: product.costPerItem ?? null,
          barcode: product.barcode ?? null,
          inventoryQuantity: product.inventoryQuantity ?? 0,
          inventoryTracking: product.inventoryTracking !== false,
          continueSellingWhenOutOfStock: product.continueSellingWhenOutOfStock === true,
          physicalProduct: product.physicalProduct !== false,
          weight: product.weight ?? null,
          vendor: product.vendor || "Sofi Knots",
          tags: product.tags ?? [],
          categoryId: product.categoryId ?? null,
          collectionId: product.collectionId ?? null,
          shortDescription: product.shortDescription,
          description: product.description,
          featuredImageUrl: product.featuredImageUrl ?? null,
          isFeatured: Boolean(product.isFeatured),
          salesChannels: product.salesChannels ?? ["online-store"],
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          seoKeywords: product.seoKeywords,
          status: product.status ?? "active",
        }),
      });

      const body = await response.json();
      setMessage(response.ok ? `Saved ${body.product?.name || product.name}.` : body.error || "Update failed.");
      if (response.ok) {
        window.location.reload();
      }
    });
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setMessage(null);
    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", "products");
    const response = await fetch("/api/admin/storage/upload", { method: "POST", body: payload });
    const body = await response.json();
    setUploading(false);

    if (!response.ok) {
      setMessage(body.error || "Image upload failed.");
      return;
    }

    updateProduct({ featuredImageUrl: body.publicUrl });
    setMessage("Image uploaded successfully. Save the product to publish it.");
  }

  async function archiveOrDeleteProduct(mode: "archive" | "delete") {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/products/${product.id}?mode=${mode}`, { method: "DELETE" });
      const body = await response.json();
      setMessage(response.ok ? `Product ${mode}d successfully.` : body.error || `Failed to ${mode} product.`);
      if (response.ok) {
        if (mode === "delete") {
          window.location.href = "/admin/products";
          return;
        }
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-brand-sand/50 bg-[#fcfaf5] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-brand-taupe">Product editor</div>
            <div className="mt-3 flex items-center gap-3">
              <h3 className="font-serif text-3xl text-brand-brown">{product.name}</h3>
              <AdminBadge tone={getStatusTone(product.status)}>{product.status ?? "active"}</AdminBadge>
            </div>
            <p className="mt-2 text-sm text-brand-warm">{product.shortDescription}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-[280px]">
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Price</p>
              <p className="mt-1 font-medium text-brand-brown">Rs. {product.price.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Inventory</p>
              <p className="mt-1 font-medium text-brand-brown">{product.inventoryQuantity ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">Basic details</h4>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input className="brand-input" value={product.name} onChange={(event) => updateProduct({ name: event.target.value, slug: slugify(event.target.value) })} />
              <input className="brand-input" value={product.slug} onChange={(event) => updateProduct({ slug: slugify(event.target.value) })} />
              <select
                className="brand-input"
                value={product.categoryId ?? ""}
                onChange={(event) => {
                  const selected = categories.find((item) => item.id === event.target.value);
                  updateProduct({ categoryId: event.target.value, category: selected?.name ?? product.category, categorySlug: selected?.slug ?? product.categorySlug });
                }}
              >
                <option value="">Category / product type</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input className="brand-input" value={product.vendor ?? ""} onChange={(event) => updateProduct({ vendor: event.target.value })} placeholder="Vendor / brand" />
            </div>
            <input className="brand-input mt-4" value={(product.tags ?? []).join(", ")} onChange={(event) => updateProduct({ tags: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} placeholder="Tags separated by commas" />
            <input className="brand-input mt-4" value={product.shortDescription} onChange={(event) => updateProduct({ shortDescription: event.target.value })} placeholder="Short description" />
            <textarea className="brand-input mt-4 min-h-32" value={product.description} onChange={(event) => updateProduct({ description: event.target.value })} />
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">Pricing</h4>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input className="brand-input" type="number" value={product.price} onChange={(event) => updateProduct({ price: Number(event.target.value) })} />
              <input className="brand-input" type="number" value={product.originalPrice ?? ""} onChange={(event) => updateProduct({ originalPrice: event.target.value ? Number(event.target.value) : undefined })} placeholder="Compare-at price" />
              <input className="brand-input" type="number" value={product.costPerItem ?? ""} onChange={(event) => updateProduct({ costPerItem: event.target.value ? Number(event.target.value) : null })} placeholder="Cost per item" />
            </div>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">Inventory</h4>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input className="brand-input" value={product.sku ?? ""} onChange={(event) => updateProduct({ sku: event.target.value })} placeholder="SKU" />
              <input className="brand-input" value={product.barcode ?? ""} onChange={(event) => updateProduct({ barcode: event.target.value })} placeholder="Barcode" />
              <input className="brand-input" type="number" value={product.inventoryQuantity ?? 0} onChange={(event) => updateProduct({ inventoryQuantity: Number(event.target.value) })} placeholder="Quantity" />
            </div>
            <div className="mt-4 grid gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
                <input type="checkbox" checked={product.inventoryTracking !== false} onChange={(event) => updateProduct({ inventoryTracking: event.target.checked })} />
                Track quantity
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
                <input type="checkbox" checked={product.continueSellingWhenOutOfStock === true} onChange={(event) => updateProduct({ continueSellingWhenOutOfStock: event.target.checked })} />
                Continue selling when out of stock
              </label>
            </div>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <ProductVariantsManager productId={product.id} basePrice={product.price} />
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">Shipping</h4>
            <div className="mt-5 grid gap-4">
              <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
                <input type="checkbox" checked={product.physicalProduct !== false} onChange={(event) => updateProduct({ physicalProduct: event.target.checked })} />
                This is a physical product
              </label>
              <input className="brand-input" type="number" value={product.weight ?? ""} onChange={(event) => updateProduct({ weight: event.target.value ? Number(event.target.value) : null })} placeholder="Weight in grams" />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">Publishing and organization</h4>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <select className="brand-input" value={product.status ?? "active"} onChange={(event) => updateProduct({ status: event.target.value as Product["status"] })}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <select
                className="brand-input"
                value={product.collectionId ?? ""}
                onChange={(event) => {
                  const selected = collections.find((item) => item.id === event.target.value);
                  updateProduct({ collectionId: event.target.value, collection: selected?.name ?? product.collection, collectionSlug: selected?.slug ?? product.collectionSlug });
                }}
              >
                <option value="">Manual collection assignment</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 grid gap-2">
              {salesChannelOptions.map((channel) => (
                <label key={channel.id} className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
                  <input
                    type="checkbox"
                    checked={(product.salesChannels ?? ["online-store"]).includes(channel.id)}
                    onChange={(event) => {
                      const current = product.salesChannels ?? ["online-store"];
                      updateProduct({
                        salesChannels: event.target.checked ? [...new Set([...current, channel.id])] : current.filter((value) => value !== channel.id),
                      });
                    }}
                  />
                  {channel.label}
                </label>
              ))}
            </div>
            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
              <input type="checkbox" checked={Boolean(product.isFeatured)} onChange={(event) => updateProduct({ isFeatured: event.target.checked })} />
              Include in featured lineup
            </label>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">SEO and URL</h4>
            <div className="mt-5 rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] p-4">
              <div className="text-lg text-[#1a0dab]">{product.seoTitle || product.name}</div>
              <div className="mt-1 text-sm text-emerald-700">{`https://sofi-knots.vercel.app/product/${product.slug}`}</div>
              <div className="mt-2 text-sm text-brand-warm">{product.seoDescription || "Add a meta description for search."}</div>
            </div>
            <div className="mt-4 grid gap-4">
              <input className="brand-input" value={product.seoTitle} onChange={(event) => updateProduct({ seoTitle: event.target.value })} placeholder="SEO title" />
              <textarea className="brand-input min-h-28" value={product.seoDescription} onChange={(event) => updateProduct({ seoDescription: event.target.value })} placeholder="Meta description" />
              <input className="brand-input" value={product.slug} onChange={(event) => updateProduct({ slug: slugify(event.target.value) })} placeholder="URL handle" />
              <input className="brand-input" value={product.seoKeywords.join(", ")} onChange={(event) => updateProduct({ seoKeywords: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} placeholder="Keywords separated by commas" />
            </div>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">Product media</h4>
            <div className="mt-5 rounded-[24px] border border-dashed border-brand-sand/60 bg-[#fcfaf5] p-4">
              {product.featuredImageUrl ? (
                <img src={product.featuredImageUrl} alt={product.name} className="aspect-[4/5] w-full rounded-[18px] object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center rounded-[18px] bg-brand-cream text-sm text-brand-taupe">No featured image yet</div>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              <input className="brand-input" value={product.featuredImageUrl ?? ""} onChange={(event) => updateProduct({ featuredImageUrl: event.target.value })} placeholder="Featured image URL" />
              <label className="brand-btn-outline cursor-pointer justify-center gap-2">
                <ImagePlus size={16} />
                {uploading ? "Uploading..." : "Upload featured image"}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} />
              </label>
            </div>
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <ProductGalleryManager productId={product.id} />
          </section>

          <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
            <h4 className="font-serif text-2xl text-brand-brown">Actions</h4>
            <div className="mt-5 grid gap-3">
              <button type="button" className="brand-btn-primary justify-center" disabled={isPending} onClick={() => void saveProduct()}>
                {isPending ? "Saving..." : "Save product"}
              </button>
              <button type="button" className="brand-btn-outline justify-center gap-2" disabled={isPending} onClick={() => void archiveOrDeleteProduct("archive")}>
                <Archive size={16} />
                Archive product
              </button>
              <button type="button" className="brand-btn-outline justify-center gap-2 border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white" disabled={isPending} onClick={() => setConfirmDelete(true)}>
                <Trash2 size={16} />
                Delete product
              </button>
            </div>
          </section>
        </div>
      </div>

      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#e7eaee] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Delete product?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">This will remove the product from the product list and storefront. This action cannot be undone.</p>
              </div>
              <button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" onClick={() => setConfirmDelete(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button type="button" className="brand-btn-primary bg-rose-600 px-4 py-2 hover:bg-rose-700" onClick={() => void archiveOrDeleteProduct("delete")}>
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
