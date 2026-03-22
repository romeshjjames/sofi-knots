"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Archive, ImagePlus, Save, Search, Trash2, X } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import { ProductGalleryManager } from "@/components/admin/product-gallery-manager";
import { ProductVariantsManager } from "@/components/admin/product-variants-manager";
import type { Product } from "@/types/commerce";

type Option = {
  id: string;
  name: string;
  slug: string;
};

type ProductManagerProps = {
  products: Product[];
  categories: Option[];
  collections: Option[];
};

type SavedViewPreset = "all" | "draft" | "active" | "needs-image" | "featured";

type SavedView = {
  id: string;
  name: string;
  query: string;
  statusFilter: "all" | "active" | "draft" | "archived";
  presetView: SavedViewPreset;
};

const presetViews: { value: SavedViewPreset; label: string }[] = [
  { value: "all", label: "All products" },
  { value: "draft", label: "Drafts" },
  { value: "active", label: "Active" },
  { value: "needs-image", label: "Needs image" },
  { value: "featured", label: "Featured" },
];

const salesChannelOptions = [
  { id: "online-store", label: "Online Store" },
  { id: "instagram-shop", label: "Instagram Shop" },
  { id: "whatsapp-orders", label: "WhatsApp Orders" },
  { id: "pop-up-events", label: "Pop-up Events" },
];

function getStatusTone(status?: Product["status"]) {
  if (status === "active") return "success";
  if (status === "draft") return "warning";
  if (status === "archived") return "danger";
  return "default";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function ProductManager({ products, categories, collections }: ProductManagerProps) {
  const [items, setItems] = useState(products);
  const [selectedId, setSelectedId] = useState(products[0]?.id ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [savedView, setSavedView] = useState<SavedViewPreset>("all");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState<string | null>(null);
  const [newSavedViewName, setNewSavedViewName] = useState("");
  const [bulkAction, setBulkAction] = useState("set-status");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!items.find((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? "");
    }
  }, [items, selectedId]);

  useEffect(() => {
    let active = true;

    async function loadSavedViews() {
      const response = await fetch("/api/admin/preferences/saved-views?scope=catalog-products");
      const body = await response.json();
      if (!response.ok || !active) return;

      const state = body.state as { views?: SavedView[]; activeViewId?: string | null };
      const nextViews = Array.isArray(state.views) ? state.views : [];
      setSavedViews(nextViews);
      setActiveSavedViewId(state.activeViewId ?? null);

      const activeView = nextViews.find((view) => view.id === state.activeViewId);
      if (activeView) {
        setQuery(activeView.query);
        setStatusFilter(activeView.statusFilter);
        setSavedView(activeView.presetView);
      }
    }

    void loadSavedViews();
    return () => {
      active = false;
    };
  }, []);

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery =
          !query ||
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.slug.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          (item.vendor ?? "").toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesView =
          savedView === "all"
            ? true
            : savedView === "draft"
              ? item.status === "draft"
              : savedView === "active"
                ? item.status === "active"
                : savedView === "needs-image"
                  ? !item.featuredImageUrl
                  : Boolean(item.isFeatured);
        return matchesQuery && matchesStatus && matchesView;
      }),
    [items, query, savedView, statusFilter],
  );

  const selectedProduct = items.find((item) => item.id === selectedId) ?? visibleItems[0] ?? items[0] ?? null;

  async function persistSavedViews(nextViews: SavedView[], nextActiveViewId: string | null) {
    const response = await fetch("/api/admin/preferences/saved-views", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: "catalog-products",
        views: nextViews,
        activeViewId: nextActiveViewId,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to persist saved views.");
      return false;
    }
    setSavedViews(nextViews);
    setActiveSavedViewId(nextActiveViewId);
    return true;
  }

  async function createSavedView() {
    const name = newSavedViewName.trim();
    if (!name) {
      setMessage("Name your view before saving it.");
      return;
    }

    const nextView: SavedView = {
      id: `view_${Date.now()}`,
      name,
      query,
      statusFilter,
      presetView: savedView,
    };
    const ok = await persistSavedViews([...savedViews, nextView], nextView.id);
    if (!ok) return;
    setNewSavedViewName("");
    setMessage(`Saved view "${name}" is now available for this admin account.`);
  }

  async function deleteSavedView(id: string) {
    const nextViews = savedViews.filter((view) => view.id !== id);
    const nextActiveViewId = activeSavedViewId === id ? null : activeSavedViewId;
    const ok = await persistSavedViews(nextViews, nextActiveViewId);
    if (!ok) return;
    setMessage("Saved view removed.");
  }

  function applySavedView(view: SavedView) {
    setQuery(view.query);
    setStatusFilter(view.statusFilter);
    setSavedView(view.presetView);
    setActiveSavedViewId(view.id);
    void persistSavedViews(savedViews, view.id);
  }

  function updateLocal(id: string, patch: Partial<Product>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function saveProduct(product: Product) {
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
      if (response.ok) window.location.reload();
    });
  }

  async function archiveOrDeleteProduct(id: string, mode: "archive" | "delete") {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/products/${id}?mode=${mode}`, { method: "DELETE" });
      const body = await response.json();
      setMessage(response.ok ? `Product ${mode}d successfully.` : body.error || `Failed to ${mode} product.`);
      if (response.ok) {
        setConfirmDelete(false);
        window.location.reload();
      }
    });
  }

  async function runBulkAction() {
    if (!selectedIds.length) {
      setMessage("Select at least one product for bulk actions.");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const payload: Record<string, unknown> = { ids: selectedIds, action: bulkAction };
      if (bulkAction === "set-status") payload.status = "active";
      const response = await fetch("/api/admin/products/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      setMessage(response.ok ? "Bulk action applied." : body.error || "Bulk action failed.");
      if (response.ok) window.location.reload();
    });
  }

  async function uploadImage(productId: string, file: File) {
    setUploadingId(productId);
    setMessage(null);
    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", "products");
    const response = await fetch("/api/admin/storage/upload", { method: "POST", body: payload });
    const body = await response.json();
    setUploadingId(null);

    if (!response.ok) {
      setMessage(body.error || "Image upload failed.");
      return;
    }

    updateLocal(productId, { featuredImageUrl: body.publicUrl });
    setMessage("Image uploaded successfully. Save the product to publish it.");
  }

  if (!selectedProduct) return <p className="text-sm text-brand-warm">No products available yet.</p>;

  const draftCount = items.filter((item) => item.status === "draft").length;
  const archivedCount = items.filter((item) => item.status === "archived").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="grid gap-3 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-brand-sand/50 bg-white px-4 py-3">
            <Search size={16} className="text-brand-taupe" />
            <input className="w-full bg-transparent text-sm text-brand-brown outline-none placeholder:text-brand-taupe" placeholder="Search products, SKU, category, vendor" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <button type="button" onClick={() => setStatusFilter("all")} className={`rounded-2xl px-3 py-3 text-sm ${statusFilter === "all" ? "bg-brand-brown text-white" : "bg-white text-brand-warm"}`}><div className="font-medium">{items.length}</div><div className="text-xs uppercase tracking-[0.16em] opacity-70">All</div></button>
            <button type="button" onClick={() => setStatusFilter("draft")} className={`rounded-2xl px-3 py-3 text-sm ${statusFilter === "draft" ? "bg-brand-brown text-white" : "bg-white text-brand-warm"}`}><div className="font-medium">{draftCount}</div><div className="text-xs uppercase tracking-[0.16em] opacity-70">Draft</div></button>
            <button type="button" onClick={() => setStatusFilter("archived")} className={`rounded-2xl px-3 py-3 text-sm ${statusFilter === "archived" ? "bg-brand-brown text-white" : "bg-white text-brand-warm"}`}><div className="font-medium">{archivedCount}</div><div className="text-xs uppercase tracking-[0.16em] opacity-70">Archived</div></button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {presetViews.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => { setSavedView(value); setActiveSavedViewId(null); }} className={`rounded-2xl px-3 py-2 ${savedView === value ? "bg-brand-gold text-white" : "bg-white text-brand-warm"}`}>{label}</button>
            ))}
          </div>
          <div className="grid gap-2 rounded-2xl border border-brand-sand/40 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Saved views</p>
              {activeSavedViewId ? <AdminBadge tone="info">Active</AdminBadge> : null}
            </div>
            <div className="grid gap-2 md:grid-cols-[1fr_auto]">
              <input className="brand-input" value={newSavedViewName} onChange={(event) => setNewSavedViewName(event.target.value)} placeholder="Save current filters as..." />
              <button type="button" className="brand-btn-outline justify-center px-4 py-2" onClick={() => void createSavedView()}><Save size={15} />Save view</button>
            </div>
            <div className="space-y-2">
              {savedViews.length ? savedViews.map((view) => (
                <div key={view.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#fcfaf5] px-3 py-2">
                  <button type="button" className="text-left text-sm text-brand-brown" onClick={() => applySavedView(view)}>
                    <div className="font-medium">{view.name}</div>
                    <div className="text-xs text-brand-taupe">{view.statusFilter} | {view.presetView} | {view.query || "no query"}</div>
                  </button>
                  <button type="button" className="text-xs font-medium text-rose-700" onClick={() => void deleteSavedView(view.id)}>Delete</button>
                </div>
              )) : <p className="text-sm text-brand-warm">No custom saved views yet. Saved views persist per admin user.</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <select className="brand-input" value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
              <option value="set-status">Bulk activate</option>
              <option value="feature">Mark featured</option>
              <option value="unfeature">Remove featured</option>
              <option value="delete">Bulk delete</option>
            </select>
            <button type="button" className="brand-btn-outline justify-center px-4 py-2" onClick={() => void runBulkAction()}>Apply to {selectedIds.length} selected</button>
          </div>
        </div>

        <div className="max-h-[900px] space-y-3 overflow-auto pr-1">
          {visibleItems.map((product) => (
            <button key={product.id} type="button" onClick={() => setSelectedId(product.id)} className={`w-full rounded-[24px] border p-4 text-left transition ${selectedProduct.id === product.id ? "border-brand-gold bg-white shadow-[0_18px_40px_rgba(65,42,17,0.08)]" : "border-brand-sand/40 bg-[#fcfaf5] hover:bg-white"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brand-taupe">
                    <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...new Set([...current, product.id])] : current.filter((id) => id !== product.id))} />
                    Select
                  </label>
                  <p className="text-lg font-medium text-brand-brown">{product.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brand-taupe">{product.slug}</p>
                </div>
                <AdminBadge tone={getStatusTone(product.status)}>{product.status ?? "active"}</AdminBadge>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-brand-warm">
                <span>{product.category}</span>
                <span>Rs. {product.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.isFeatured ? <AdminBadge tone="info">Featured</AdminBadge> : null}
                {product.featuredImageUrl ? <AdminBadge tone="success">Image ready</AdminBadge> : <AdminBadge tone="warning">Needs image</AdminBadge>}
                {product.sku ? <AdminBadge tone="default">SKU set</AdminBadge> : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-brand-sand/50 bg-[#fcfaf5] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-brand-taupe">Home / Products / {selectedProduct.name}</div>
              <div className="mt-3 flex items-center gap-3">
                <h3 className="font-serif text-3xl text-brand-brown">{selectedProduct.name}</h3>
                <AdminBadge tone={getStatusTone(selectedProduct.status)}>{selectedProduct.status ?? "active"}</AdminBadge>
              </div>
              <p className="mt-2 text-sm text-brand-warm">{selectedProduct.shortDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm lg:min-w-[280px]">
              <div className="rounded-2xl bg-white px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Price</p><p className="mt-1 font-medium text-brand-brown">Rs. {selectedProduct.price.toLocaleString("en-IN")}</p></div>
              <div className="rounded-2xl bg-white px-4 py-3"><p className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Inventory</p><p className="mt-1 font-medium text-brand-brown">{selectedProduct.inventoryQuantity ?? 0}</p></div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">Basic details</h4>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input className="brand-input" value={selectedProduct.name} onChange={(event) => updateLocal(selectedProduct.id, { name: event.target.value, slug: slugify(event.target.value) })} />
                <input className="brand-input" value={selectedProduct.slug} onChange={(event) => updateLocal(selectedProduct.id, { slug: slugify(event.target.value) })} />
                <select className="brand-input" value={selectedProduct.categoryId ?? ""} onChange={(event) => { const selected = categories.find((item) => item.id === event.target.value); updateLocal(selectedProduct.id, { categoryId: event.target.value, category: selected?.name ?? selectedProduct.category, categorySlug: selected?.slug ?? selectedProduct.categorySlug }); }}>
                  <option value="">Category / product type</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <input className="brand-input" value={selectedProduct.vendor ?? ""} onChange={(event) => updateLocal(selectedProduct.id, { vendor: event.target.value })} placeholder="Vendor / brand" />
              </div>
              <input className="brand-input mt-4" value={(selectedProduct.tags ?? []).join(", ")} onChange={(event) => updateLocal(selectedProduct.id, { tags: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} placeholder="Tags separated by commas" />
              <input className="brand-input mt-4" value={selectedProduct.shortDescription} onChange={(event) => updateLocal(selectedProduct.id, { shortDescription: event.target.value })} placeholder="Short description" />
              <textarea className="brand-input mt-4 min-h-32" value={selectedProduct.description} onChange={(event) => updateLocal(selectedProduct.id, { description: event.target.value })} />
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">Pricing</h4>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <input className="brand-input" type="number" value={selectedProduct.price} onChange={(event) => updateLocal(selectedProduct.id, { price: Number(event.target.value) })} />
                <input className="brand-input" type="number" value={selectedProduct.originalPrice ?? ""} onChange={(event) => updateLocal(selectedProduct.id, { originalPrice: event.target.value ? Number(event.target.value) : undefined })} placeholder="Compare-at price" />
                <input className="brand-input" type="number" value={selectedProduct.costPerItem ?? ""} onChange={(event) => updateLocal(selectedProduct.id, { costPerItem: event.target.value ? Number(event.target.value) : null })} placeholder="Cost per item" />
              </div>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">Inventory</h4>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <input className="brand-input" value={selectedProduct.sku ?? ""} onChange={(event) => updateLocal(selectedProduct.id, { sku: event.target.value })} placeholder="SKU" />
                <input className="brand-input" value={selectedProduct.barcode ?? ""} onChange={(event) => updateLocal(selectedProduct.id, { barcode: event.target.value })} placeholder="Barcode" />
                <input className="brand-input" type="number" value={selectedProduct.inventoryQuantity ?? 0} onChange={(event) => updateLocal(selectedProduct.id, { inventoryQuantity: Number(event.target.value) })} placeholder="Quantity" />
              </div>
              <div className="mt-4 grid gap-3">
                <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown"><input type="checkbox" checked={selectedProduct.inventoryTracking !== false} onChange={(event) => updateLocal(selectedProduct.id, { inventoryTracking: event.target.checked })} />Track quantity</label>
                <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown"><input type="checkbox" checked={selectedProduct.continueSellingWhenOutOfStock === true} onChange={(event) => updateLocal(selectedProduct.id, { continueSellingWhenOutOfStock: event.target.checked })} />Continue selling when out of stock</label>
              </div>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <ProductVariantsManager productId={selectedProduct.id} basePrice={selectedProduct.price} />
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">Shipping</h4>
              <div className="mt-5 grid gap-4">
                <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown"><input type="checkbox" checked={selectedProduct.physicalProduct !== false} onChange={(event) => updateLocal(selectedProduct.id, { physicalProduct: event.target.checked })} />This is a physical product</label>
                <input className="brand-input" type="number" value={selectedProduct.weight ?? ""} onChange={(event) => updateLocal(selectedProduct.id, { weight: event.target.value ? Number(event.target.value) : null })} placeholder="Weight in grams" />
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">Publishing and organization</h4>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <select className="brand-input" value={selectedProduct.status ?? "active"} onChange={(event) => updateLocal(selectedProduct.id, { status: event.target.value as Product["status"] })}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
                <select className="brand-input" value={selectedProduct.collectionId ?? ""} onChange={(event) => { const selected = collections.find((item) => item.id === event.target.value); updateLocal(selectedProduct.id, { collectionId: event.target.value, collection: selected?.name ?? selectedProduct.collection, collectionSlug: selected?.slug ?? selectedProduct.collectionSlug }); }}>
                  <option value="">Manual collection assignment</option>
                  {collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
                </select>
              </div>
              <div className="mt-4 grid gap-2">
                {salesChannelOptions.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown">
                    <input type="checkbox" checked={(selectedProduct.salesChannels ?? ["online-store"]).includes(channel.id)} onChange={(event) => { const current = selectedProduct.salesChannels ?? ["online-store"]; updateLocal(selectedProduct.id, { salesChannels: event.target.checked ? [...new Set([...current, channel.id])] : current.filter((value) => value !== channel.id) }); }} />
                    {channel.label}
                  </label>
                ))}
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-sand/40 px-4 py-3 text-sm text-brand-brown"><input type="checkbox" checked={Boolean(selectedProduct.isFeatured)} onChange={(event) => updateLocal(selectedProduct.id, { isFeatured: event.target.checked })} />Include in featured lineup</label>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">SEO and URL</h4>
              <div className="mt-5 rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] p-4">
                <div className="text-lg text-[#1a0dab]">{selectedProduct.seoTitle || selectedProduct.name}</div>
                <div className="mt-1 text-sm text-emerald-700">{`https://sofi-knots.vercel.app/product/${selectedProduct.slug}`}</div>
                <div className="mt-2 text-sm text-brand-warm">{selectedProduct.seoDescription || "Add a meta description for search."}</div>
              </div>
              <div className="mt-4 grid gap-4">
                <input className="brand-input" value={selectedProduct.seoTitle} onChange={(event) => updateLocal(selectedProduct.id, { seoTitle: event.target.value })} placeholder="SEO title" />
                <textarea className="brand-input min-h-28" value={selectedProduct.seoDescription} onChange={(event) => updateLocal(selectedProduct.id, { seoDescription: event.target.value })} placeholder="Meta description" />
                <input className="brand-input" value={selectedProduct.slug} onChange={(event) => updateLocal(selectedProduct.id, { slug: slugify(event.target.value) })} placeholder="URL handle" />
                <input className="brand-input" value={selectedProduct.seoKeywords.join(", ")} onChange={(event) => updateLocal(selectedProduct.id, { seoKeywords: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) })} placeholder="Keywords separated by commas" />
              </div>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">Product media</h4>
              <div className="mt-5 rounded-[24px] border border-dashed border-brand-sand/60 bg-[#fcfaf5] p-4">
                {selectedProduct.featuredImageUrl ? <img src={selectedProduct.featuredImageUrl} alt={selectedProduct.name} className="aspect-[4/5] w-full rounded-[18px] object-cover" /> : <div className="flex aspect-[4/5] items-center justify-center rounded-[18px] bg-brand-cream text-sm text-brand-taupe">No featured image yet</div>}
              </div>
              <div className="mt-4 grid gap-3">
                <input className="brand-input" value={selectedProduct.featuredImageUrl ?? ""} onChange={(event) => updateLocal(selectedProduct.id, { featuredImageUrl: event.target.value })} placeholder="Featured image URL" />
                <label className="brand-btn-outline cursor-pointer justify-center gap-2">
                  <ImagePlus size={16} />
                  {uploadingId === selectedProduct.id ? "Uploading..." : "Upload featured image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(selectedProduct.id, file); }} />
                </label>
              </div>
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <ProductGalleryManager productId={selectedProduct.id} />
            </section>

            <section className="rounded-[28px] border border-brand-sand/60 bg-white p-6">
              <h4 className="font-serif text-2xl text-brand-brown">Actions</h4>
              <div className="mt-5 grid gap-3">
                <button type="button" className="brand-btn-primary justify-center" disabled={isPending} onClick={() => void saveProduct(selectedProduct)}>{isPending ? "Saving..." : "Save product"}</button>
                <button type="button" className="brand-btn-outline justify-center gap-2" disabled={isPending} onClick={() => void archiveOrDeleteProduct(selectedProduct.id, "archive")}><Archive size={16} />Archive product</button>
                <button type="button" className="brand-btn-outline justify-center gap-2 border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white" disabled={isPending} onClick={() => setConfirmDelete(true)}><Trash2 size={16} />Delete product</button>
              </div>
            </section>
          </div>
        </div>

        {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#e7eaee] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Delete product?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">This will remove the product from the product list and storefront. This action cannot be undone.</p>
              </div>
              <button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" onClick={() => setConfirmDelete(false)}><X size={16} /></button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button type="button" className="brand-btn-primary bg-rose-600 px-4 py-2 hover:bg-rose-700" onClick={() => void archiveOrDeleteProduct(selectedProduct.id, "delete")}>Confirm delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
