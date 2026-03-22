"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Eye, Filter, PencilLine, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { CollectionAdminSettingsRecord, CollectionConditionRecord } from "@/lib/admin-data";
import { resolveCollectionProducts } from "@/lib/catalog";
import type { Collection, Product } from "@/types/commerce";

type CollectionListItem = Collection & {
  updatedAt: string | null;
  productCount: number;
  settings: CollectionAdminSettingsRecord;
};

type Props = {
  collections: CollectionListItem[];
  products: Product[];
};

type CollectionEditor = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  collectionType: "manual" | "automated";
  status: "active" | "draft";
  visibility: "visible" | "hidden";
  onlineStoreEnabled: boolean;
  salesChannels: string[];
  assignedProductIds: string[];
  sortProducts: "manual" | "best-selling" | "alphabetical" | "price-asc" | "price-desc" | "newest";
  conditions: CollectionConditionRecord[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  updatedAt: string | null;
};

const emptyEditor: CollectionEditor = {
  title: "",
  slug: "",
  description: "",
  imageUrl: "",
  collectionType: "manual",
  status: "draft",
  visibility: "visible",
  onlineStoreEnabled: true,
  salesChannels: ["online-store"],
  assignedProductIds: [],
  sortProducts: "manual",
  conditions: [],
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  updatedAt: null,
};

const salesChannelOptions = [
  { id: "online-store", label: "Online store" },
  { id: "instagram-shop", label: "Instagram shop" },
  { id: "whatsapp-orders", label: "WhatsApp orders" },
  { id: "pop-up-events", label: "Pop-up events" },
];

const suggestedCollections = ["Macrame Bags", "Clutches", "Handbags", "Accessories", "Premium Collection", "New Arrivals", "Best Sellers", "Custom Pieces"];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function mapCollectionToEditor(collection: CollectionListItem): CollectionEditor {
  return {
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    imageUrl: collection.imageUrl ?? "",
    collectionType: collection.settings.collectionType,
    status: collection.settings.status,
    visibility: collection.settings.visibility,
    onlineStoreEnabled: collection.settings.onlineStoreEnabled,
    salesChannels: collection.settings.salesChannels,
    assignedProductIds: collection.settings.assignedProductIds,
    sortProducts: collection.settings.sortProducts,
    conditions: collection.settings.conditions,
    seoTitle: collection.seoTitle,
    seoDescription: collection.seoDescription,
    seoKeywords: collection.seoKeywords.join(", "),
    updatedAt: collection.updatedAt,
  };
}

export function CollectionsAdmin({ collections, products }: Props) {
  const [items, setItems] = useState(collections);
  const [selectedId, setSelectedId] = useState<string | null>(collections[0]?.id ?? null);
  const [editor, setEditor] = useState<CollectionEditor>(collections[0] ? mapCollectionToEditor(collections[0]) : emptyEditor);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "manual" | "automated">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [sortBy, setSortBy] = useState<"updated" | "name" | "count">("updated");
  const [productSearch, setProductSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const visibleCollections = useMemo(() => {
    const filtered = items.filter((collection) => {
      const matchesQuery =
        !query ||
        collection.title.toLowerCase().includes(query.toLowerCase()) ||
        collection.slug.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "all" || collection.settings.collectionType === typeFilter;
      const matchesStatus = statusFilter === "all" || collection.settings.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === "name") return left.title.localeCompare(right.title);
      if (sortBy === "count") return right.productCount - left.productCount;
      return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
    });
  }, [items, query, typeFilter, statusFilter, sortBy]);

  const selectedProducts = useMemo(
    () => products.filter((product) => editor.assignedProductIds.includes(product.id)),
    [editor.assignedProductIds, products],
  );

  const automatedMatches = useMemo(
    () =>
      resolveCollectionProducts({
        collection: {
          id: editor.id,
          title: editor.title || "Untitled collection",
          slug: editor.slug || "untitled-collection",
          description: editor.description,
          image: items[0]?.image ?? collections[0]?.image ?? ({} as Collection["image"]),
          imageUrl: editor.imageUrl || null,
          seoTitle: editor.seoTitle || editor.title || "Untitled collection",
          seoDescription: editor.seoDescription || editor.description || "",
          seoKeywords: editor.seoKeywords.split(",").map((value) => value.trim()).filter(Boolean),
        },
        products,
        settings: {
          collectionId: editor.id ?? "new-collection",
          collectionType: editor.collectionType,
          status: editor.status,
          visibility: editor.visibility,
          onlineStoreEnabled: editor.onlineStoreEnabled,
          salesChannels: editor.salesChannels,
          assignedProductIds: editor.assignedProductIds,
          sortProducts: editor.sortProducts,
          conditions: editor.conditions,
          updatedAt: editor.updatedAt,
        },
      }),
    [collections, editor, items, products],
  );

  const assignableProducts = useMemo(() => {
    const base = products.filter((product) => !editor.assignedProductIds.includes(product.id));
    if (!productSearch) return base;
    return base.filter((product) => product.name.toLowerCase().includes(productSearch.toLowerCase()) || product.slug.toLowerCase().includes(productSearch.toLowerCase()));
  }, [editor.assignedProductIds, productSearch, products]);

  function pickCollection(id: string | null) {
    setSelectedId(id);
    if (!id) {
      setEditor(emptyEditor);
      return;
    }
    const selected = items.find((item) => item.id === id);
    if (selected) setEditor(mapCollectionToEditor(selected));
  }

  function openCreateCollection(name?: string) {
    setSelectedId(null);
    setEditor({
      ...emptyEditor,
      title: name ?? "",
      slug: name ? slugify(name) : "",
      seoTitle: name ? `${name} | Sofi Knots` : "",
    });
  }

  function showSuccessToast(text: string) {
    setMessage(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3200);
  }

  function moveAssignedProduct(productId: string, direction: "up" | "down") {
    setEditor((current) => {
      const index = current.assignedProductIds.indexOf(productId);
      if (index === -1) return current;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.assignedProductIds.length) return current;
      const next = [...current.assignedProductIds];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return { ...current, assignedProductIds: next };
    });
  }

  async function uploadImage(file: File) {
    setIsUploading(true);
    setMessage(null);
    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", "collections");
    const response = await fetch("/api/admin/storage/upload", { method: "POST", body: payload });
    const body = await response.json();
    setIsUploading(false);
    if (!response.ok) {
      setMessage(body.error || "Image upload failed.");
      return;
    }
    setEditor((current) => ({ ...current, imageUrl: body.publicUrl }));
    showSuccessToast("Collection image uploaded.");
  }

  async function saveCollection(nextStatus?: "draft" | "active") {
    const payload = {
      name: editor.title,
      slug: editor.slug,
      description: editor.description,
      imageUrl: editor.imageUrl || null,
      seoTitle: editor.seoTitle || editor.title,
      seoDescription: editor.seoDescription || editor.description,
      seoKeywords: editor.seoKeywords.split(",").map((value) => value.trim()).filter(Boolean),
      collectionType: editor.collectionType,
      status: nextStatus ?? editor.status,
      visibility: editor.visibility,
      onlineStoreEnabled: editor.onlineStoreEnabled,
      salesChannels: editor.salesChannels,
      assignedProductIds: editor.collectionType === "manual" ? editor.assignedProductIds : [],
      sortProducts: editor.sortProducts,
      conditions: editor.collectionType === "automated" ? editor.conditions : [],
    };

    startTransition(async () => {
      const endpoint = editor.id ? `/api/admin/collections/${editor.id}` : "/api/admin/collections";
      const method = editor.id ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save collection.");
        return;
      }
      const nextId = editor.id ?? body.collection?.id;
      const nextCollection: CollectionListItem = {
        id: nextId,
        title: editor.title,
        slug: editor.slug,
        description: editor.description,
        imageUrl: editor.imageUrl || null,
        image: items[0]?.image ?? collections[0]?.image ?? ({} as Collection["image"]),
        seoTitle: editor.seoTitle || editor.title,
        seoDescription: editor.seoDescription || editor.description,
        seoKeywords: editor.seoKeywords.split(",").map((value) => value.trim()).filter(Boolean),
        productCount: editor.collectionType === "manual" ? editor.assignedProductIds.length : automatedMatches.length,
        updatedAt: new Date().toISOString(),
        settings: {
          collectionId: nextId,
          collectionType: editor.collectionType,
          status: nextStatus ?? editor.status,
          visibility: editor.visibility,
          onlineStoreEnabled: editor.onlineStoreEnabled,
          salesChannels: editor.salesChannels,
          assignedProductIds: editor.collectionType === "manual" ? editor.assignedProductIds : [],
          sortProducts: editor.sortProducts,
          conditions: editor.collectionType === "automated" ? editor.conditions : [],
          updatedAt: new Date().toISOString(),
        },
      };
      setItems((current) => {
        const exists = current.some((item) => item.id === nextId);
        return exists ? current.map((item) => (item.id === nextId ? nextCollection : item)) : [nextCollection, ...current];
      });
      setSelectedId(nextId);
      setEditor((current) => ({ ...current, id: nextId, status: nextStatus ?? current.status, updatedAt: new Date().toISOString() }));
      showSuccessToast(`Collection ${editor.id ? "updated" : "created"} successfully.`);
    });
  }

  async function deleteCollection() {
    if (!editor.id) return;
    startTransition(async () => {
      const response = await fetch(`/api/admin/collections/${editor.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to delete collection.");
        return;
      }
      setConfirmDelete(false);
      setItems((current) => current.filter((item) => item.id !== editor.id));
      openCreateCollection();
      showSuccessToast("Collection deleted.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Home / Products / Collections / {editor.id ? editor.title || "Edit collection" : "Create collection"}</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Collections</h2>
        </div>
        <button type="button" className="brand-btn-primary px-5 py-3" onClick={() => openCreateCollection()}>
          <Plus size={16} />
          Create Collection
        </button>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-[260px] items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-500">
                <Search size={16} />
                <input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Search collections" value={query} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-600">
                  <Filter size={15} />
                  <select className="bg-transparent outline-none" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
                    <option value="all">All types</option>
                    <option value="manual">Manual</option>
                    <option value="automated">Automated</option>
                  </select>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-600">
                  <ChevronDown size={15} />
                  <select className="bg-transparent outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-600">
                  <ChevronDown size={15} />
                  <select className="bg-transparent outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                    <option value="updated">Sort by updated</option>
                    <option value="name">Sort by name</option>
                    <option value="count">Sort by product count</option>
                  </select>
                </div>
              </div>
            </div>

            {visibleCollections.length ? (
              <div className="mt-5 overflow-hidden rounded-[24px] border border-[#e7eaee]">
                <table className="min-w-full divide-y divide-[#edf0f2]">
                  <thead className="bg-[#fbfcfd] text-left text-xs uppercase tracking-[0.16em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Collection</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Product count</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Last updated</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0f2] bg-white text-sm">
                    {visibleCollections.map((collection) => (
                      <tr key={collection.id} className="transition hover:bg-[#fbfcfd]">
                        <td className="px-4 py-4">
                          <button type="button" className="flex items-center gap-3 text-left" onClick={() => pickCollection(collection.id ?? null)}>
                            <div className="h-14 w-14 overflow-hidden rounded-2xl border border-[#e7eaee] bg-[#f6f7f8]">
                              {collection.imageUrl ? <img src={collection.imageUrl} alt={collection.title} className="h-full w-full object-cover" /> : null}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{collection.title}</div>
                              <div className="mt-1 text-slate-500">{collection.slug}</div>
                            </div>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <AdminBadge tone="default">{collection.settings.collectionType === "automated" ? "Automated" : "Manual"}</AdminBadge>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{collection.productCount}</td>
                        <td className="px-4 py-4">
                          <AdminBadge tone={collection.settings.status === "active" ? "success" : "warning"}>{collection.settings.status}</AdminBadge>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{collection.updatedAt ? new Date(collection.updatedAt).toLocaleDateString("en-IN") : "Not saved yet"}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" className="rounded-xl border border-[#e7eaee] p-2 text-slate-500 hover:bg-[#fbfcfd]" onClick={() => pickCollection(collection.id ?? null)} title="Edit">
                              <PencilLine size={15} />
                            </button>
                            <button type="button" className="rounded-xl border border-[#e7eaee] p-2 text-slate-500 hover:bg-[#fbfcfd]" onClick={() => pickCollection(collection.id ?? null)} title="View">
                              <Eye size={15} />
                            </button>
                            <Link href={`/collections/${collection.slug}`} target="_blank" rel="noreferrer" className="rounded-xl border border-[#e7eaee] p-2 text-slate-500 hover:bg-[#fbfcfd]">
                              <ExternalLink size={15} />
                            </Link>
                            <button
                              type="button"
                              className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                              title="Delete"
                              onClick={() => {
                                pickCollection(collection.id ?? null);
                                setConfirmDelete(true);
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-[24px] border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-8 text-center">
                <h3 className="text-lg font-medium text-slate-900">No collections yet</h3>
                <p className="mt-2 text-sm text-slate-500">Create your first collection or start from one of these premium starter examples.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestedCollections.map((name) => (
                    <button key={name} type="button" className="rounded-full border border-[#e7eaee] bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300" onClick={() => openCreateCollection(name)}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6 2xl:sticky 2xl:top-6 2xl:self-start">
          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{editor.id ? "Edit collection" : "Create collection"}</div>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{editor.title || "Untitled collection"}</h3>
              </div>
              {editor.id ? (
                <button type="button" className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={16} />
                </button>
              ) : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-950">Basic details</h4>
            <div className="mt-4 grid gap-4">
              <input
                className="brand-input"
                placeholder="Collection title"
                value={editor.title}
                onChange={(event) =>
                  setEditor((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: slugify(event.target.value),
                    seoTitle: current.seoTitle || `${event.target.value} | Sofi Knots`,
                  }))
                }
              />
              <textarea className="brand-input min-h-28" placeholder="Description" value={editor.description} onChange={(event) => setEditor((current) => ({ ...current, description: event.target.value }))} />
              <select className="brand-input" value={editor.collectionType} onChange={(event) => setEditor((current) => ({ ...current, collectionType: event.target.value as CollectionEditor["collectionType"] }))}>
                <option value="manual">Manual collection</option>
                <option value="automated">Automated collection</option>
              </select>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-950">Collection image</h4>
            <div className="mt-4 overflow-hidden rounded-[24px] border border-dashed border-[#d9dee5] bg-[#fbfcfd]">
              {editor.imageUrl ? (
                <img src={editor.imageUrl} alt={editor.title || "Collection preview"} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center text-sm text-slate-500">Upload a collection cover image</div>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              <input className="brand-input" placeholder="Collection image URL" value={editor.imageUrl} onChange={(event) => setEditor((current) => ({ ...current, imageUrl: event.target.value }))} />
              <label className="brand-btn-outline cursor-pointer justify-center px-4 py-2">
                <Upload size={15} />
                {isUploading ? "Uploading..." : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && void uploadImage(event.target.files[0])} />
              </label>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-950">Product assignment</h4>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{editor.collectionType === "manual" ? "Manual collection" : "Automated collection"}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {editor.collectionType === "manual"
                      ? "Save the collection, then browse and add products one by one, just like Shopify."
                      : "Matching products are pulled automatically from the rules below."}
                  </div>
                </div>
                {editor.collectionType === "manual" ? (
                  <button type="button" className="rounded-xl border border-[#d9dee5] bg-white px-3 py-2 text-sm font-medium text-slate-700">
                    Browse / Add products
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-500">
                <Search size={16} />
                <input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Search products" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} />
              </div>
              {editor.collectionType === "manual" ? (
                <>
                  <div className="max-h-48 space-y-2 overflow-auto">
                    {assignableProducts.slice(0, 8).map((product) => (
                      <button key={product.id} type="button" className="flex w-full items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-left text-sm transition hover:bg-white" onClick={() => setEditor((current) => ({ ...current, assignedProductIds: [...current.assignedProductIds, product.id] }))}>
                        <div>
                          <div className="font-medium text-slate-900">{product.name}</div>
                          <div className="text-slate-500">{product.category}</div>
                        </div>
                        <Plus size={15} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-700">Selected products</div>
                    <div className="space-y-2">
                      {selectedProducts.length ? selectedProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between rounded-2xl border border-[#e7eaee] px-4 py-3">
                          <div>
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-500">{product.shortDescription}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-[#f6f7f8]" onClick={() => moveAssignedProduct(product.id, "up")} title="Move up">
                              <ArrowUp size={15} />
                            </button>
                            <button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-[#f6f7f8]" onClick={() => moveAssignedProduct(product.id, "down")} title="Move down">
                              <ArrowDown size={15} />
                            </button>
                            <button type="button" className="rounded-xl p-2 text-slate-400 hover:bg-[#f6f7f8]" onClick={() => setEditor((current) => ({ ...current, assignedProductIds: current.assignedProductIds.filter((id) => id !== product.id) }))}>
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      )) : <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">No products selected yet.</div>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">
                    Automated collections match products dynamically from the rules below.
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-700">Matched products preview</div>
                    <div className="space-y-2">
                      {automatedMatches.length ? (
                        automatedMatches.slice(0, 8).map((product) => (
                          <div key={product.id} className="rounded-2xl border border-[#e7eaee] bg-white px-4 py-3">
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="mt-1 text-sm text-slate-500">
                              {product.category} • Rs. {product.price.toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">
                          No products match the current rules yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <select className="brand-input" value={editor.sortProducts} onChange={(event) => setEditor((current) => ({ ...current, sortProducts: event.target.value as CollectionEditor["sortProducts"] }))}>
                <option value="manual">Manual sort</option>
                <option value="best-selling">Best selling</option>
                <option value="alphabetical">Alphabetical</option>
                <option value="price-asc">Price low to high</option>
                <option value="price-desc">Price high to low</option>
                <option value="newest">Newest first</option>
              </select>
            </div>
          </section>

          {editor.collectionType === "automated" ? (
            <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
              <h4 className="text-lg font-semibold text-slate-950">Automated collection conditions</h4>
              <div className="mt-4 space-y-3">
                {editor.conditions.map((condition) => (
                  <div key={condition.id} className="grid gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-3">
                    <div className="grid gap-3 md:grid-cols-3">
                      <select className="brand-input" value={condition.rule} onChange={(event) => setEditor((current) => ({ ...current, conditions: current.conditions.map((entry) => entry.id === condition.id ? { ...entry, rule: event.target.value as CollectionConditionRecord["rule"] } : entry) }))}>
                        <option value="title">Product title</option>
                        <option value="tag">Product tag</option>
                        <option value="type">Product type</option>
                        <option value="vendor">Vendor</option>
                        <option value="price">Price</option>
                      </select>
                      <select className="brand-input" value={condition.operator} onChange={(event) => setEditor((current) => ({ ...current, conditions: current.conditions.map((entry) => entry.id === condition.id ? { ...entry, operator: event.target.value as CollectionConditionRecord["operator"] } : entry) }))}>
                        <option value="equals">equals</option>
                        <option value="contains">contains</option>
                        <option value="greater_than">is greater than</option>
                        <option value="less_than">is less than</option>
                      </select>
                      <input className="brand-input" value={condition.value} placeholder="Condition value" onChange={(event) => setEditor((current) => ({ ...current, conditions: current.conditions.map((entry) => entry.id === condition.id ? { ...entry, value: event.target.value } : entry) }))} />
                    </div>
                    <div className="flex justify-end">
                      <button type="button" className="text-sm font-medium text-rose-600" onClick={() => setEditor((current) => ({ ...current, conditions: current.conditions.filter((entry) => entry.id !== condition.id) }))}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => setEditor((current) => ({ ...current, conditions: [...current.conditions, { id: `condition_${Date.now()}`, rule: "title", operator: "contains", value: "" }] }))}>
                  <Plus size={15} />
                  Add condition
                </button>
              </div>
            </section>
          ) : null}

          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-950">Sales channels and visibility</h4>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Online store</span>
                <input type="checkbox" checked={editor.onlineStoreEnabled} onChange={(event) => setEditor((current) => ({ ...current, onlineStoreEnabled: event.target.checked }))} />
              </label>
              <div className="grid gap-2">
                {salesChannelOptions.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={editor.salesChannels.includes(channel.id)}
                      onChange={(event) => setEditor((current) => ({ ...current, salesChannels: event.target.checked ? [...new Set([...current.salesChannels, channel.id])] : current.salesChannels.filter((entry) => entry !== channel.id) }))}
                    />
                    {channel.label}
                  </label>
                ))}
              </div>
              <select className="brand-input" value={editor.visibility} onChange={(event) => setEditor((current) => ({ ...current, visibility: event.target.value as CollectionEditor["visibility"] }))}>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
              <select className="brand-input" value={editor.status} onChange={(event) => setEditor((current) => ({ ...current, status: event.target.value as CollectionEditor["status"] }))}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-950">Search engine listing preview</h4>
            <div className="mt-4 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Preview</div>
              <div className="mt-3 text-lg text-[#1a0dab]">{editor.seoTitle || editor.title || "Collection title"}</div>
              <div className="mt-1 text-sm text-emerald-700">{`https://sofi-knots.vercel.app/collections/${editor.slug || "new-collection"}`}</div>
              <div className="mt-2 text-sm text-slate-600">{editor.seoDescription || editor.description || "Add a meta description for search and social previews."}</div>
            </div>
            <div className="mt-4 grid gap-4">
              <input className="brand-input" placeholder="Page title" value={editor.seoTitle} onChange={(event) => setEditor((current) => ({ ...current, seoTitle: event.target.value }))} />
              <textarea className="brand-input min-h-24" placeholder="Meta description" value={editor.seoDescription} onChange={(event) => setEditor((current) => ({ ...current, seoDescription: event.target.value }))} />
              <input className="brand-input" placeholder="URL handle" value={editor.slug} onChange={(event) => setEditor((current) => ({ ...current, slug: slugify(event.target.value) }))} />
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <button type="button" className="brand-btn-primary px-5 py-3" disabled={isPending || isUploading} onClick={() => void saveCollection("active")}>
                {isPending ? "Saving..." : "Save"}
              </button>
              <button type="button" className="brand-btn-outline px-5 py-3" disabled={isPending || isUploading} onClick={() => void saveCollection("draft")}>
                Save as draft
              </button>
              <button type="button" className="brand-btn-outline px-5 py-3" onClick={() => pickCollection(selectedId)}>
                Cancel
              </button>
              {editor.id ? (
                <button type="button" className="brand-btn-outline border-rose-200 px-5 py-3 text-rose-600 hover:bg-rose-600 hover:text-white" onClick={() => setConfirmDelete(true)}>
                  Delete collection
                </button>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      {showToast && message ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-xl">
          <div className="text-sm font-medium text-emerald-700">{message}</div>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[#e7eaee] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-950">Delete collection?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">This removes the collection page and grouping only. Products inside the collection will remain in the store and will not be deleted.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button type="button" className="brand-btn-primary bg-rose-600 px-4 py-2 hover:bg-rose-700" onClick={() => void deleteCollection()}>
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
