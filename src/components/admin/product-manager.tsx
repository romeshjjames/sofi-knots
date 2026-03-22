"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Eye, PencilLine, Save, Search, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { Product } from "@/types/commerce";

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

function getStatusTone(status?: Product["status"]) {
  if (status === "active") return "success";
  if (status === "draft") return "warning";
  if (status === "archived") return "danger";
  return "default";
}

export function ProductManager({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [savedView, setSavedView] = useState<SavedViewPreset>("all");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState<string | null>(null);
  const [newSavedViewName, setNewSavedViewName] = useState("");
  const [bulkAction, setBulkAction] = useState("set-status");
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

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

  async function deleteProduct(product: Product) {
    setMessage(null);
    const response = await fetch(`/api/admin/products/${product.id}?mode=delete`, {
      method: "DELETE",
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Product delete failed.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== product.id));
    setSelectedIds((current) => current.filter((id) => id !== product.id));
    setDeleteCandidate(null);
    setMessage(`Deleted "${product.name}".`);
  }

  async function cloneProduct(product: Product) {
    setMessage(null);
    const response = await fetch(`/api/admin/products/${product.id}/clone`, { method: "POST" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Product clone failed.");
      return;
    }
    window.open(`/admin/products/${body.product.id}`, "_blank", "noopener,noreferrer");
    setMessage(`Duplicated "${product.name}".`);
    window.location.reload();
  }

  const draftCount = items.filter((item) => item.status === "draft").length;
  const archivedCount = items.filter((item) => item.status === "archived").length;
  const activeCount = items.filter((item) => item.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#e7eaee] bg-white">
        <div className="border-b border-[#eef1f4] px-5 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search products, SKU, category, vendor"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="min-w-[160px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "draft" | "archived")}
            >
              <option value="all">All statuses ({items.length})</option>
              <option value="active">Active ({activeCount})</option>
              <option value="draft">Draft ({draftCount})</option>
              <option value="archived">Archived ({archivedCount})</option>
            </select>
            <select
              className="min-w-[160px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={savedView}
              onChange={(event) => {
                setSavedView(event.target.value as SavedViewPreset);
                setActiveSavedViewId(null);
              }}
            >
              {presetViews.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select className="min-w-[190px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
              <option value="set-status">Bulk activate</option>
              <option value="feature">Mark featured</option>
              <option value="unfeature">Remove featured</option>
              <option value="delete">Bulk delete</option>
            </select>
            <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => void runBulkAction()}>
              Apply to {selectedIds.length} selected
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {savedViews.map((view) => (
                <div key={view.id} className="inline-flex items-center gap-2 rounded-full border border-[#e7eaee] bg-[#fbfcfd] px-3 py-2">
                  <button type="button" className="text-sm text-slate-700" onClick={() => applySavedView(view)}>
                    {view.name}
                  </button>
                  <button type="button" className="text-xs font-medium text-rose-700" onClick={() => void deleteSavedView(view.id)}>
                    Remove
                  </button>
                </div>
              ))}
              {savedViews.length === 0 ? <p className="text-sm text-slate-500">No saved views yet.</p> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="min-w-[220px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                value={newSavedViewName}
                onChange={(event) => setNewSavedViewName(event.target.value)}
                placeholder="Save current filters as..."
              />
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => void createSavedView()}>
                <Save size={15} />
                Save view
              </button>
            </div>
          </div>
          {activeSavedViewId ? (
            <div className="mt-3">
              <AdminBadge tone="info">Saved view active</AdminBadge>
            </div>
          ) : null}
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">SKU</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((product) => (
                <tr key={product.id} className="border-t border-[#eef1f4]">
                  <td className="px-5 py-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...new Set([...current, product.id])] : current.filter((id) => id !== product.id))} />
                      <div>
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{product.vendor || "Sofi Knots"}</div>
                      </div>
                    </label>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{product.sku || "Not set"}</td>
                  <td className="px-5 py-4 text-slate-600">{product.category}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">Rs. {product.price.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4">
                    <AdminBadge tone={getStatusTone(product.status)}>{product.status ?? "active"}</AdminBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Edit ${product.name}`}
                        title="Edit product"
                      >
                        <PencilLine size={16} />
                      </Link>
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Preview ${product.name}`}
                        title="Preview product"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Clone ${product.name}`}
                        title="Clone product"
                        onClick={() => void cloneProduct(product)}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50"
                        aria-label={`Delete ${product.name}`}
                        title="Delete product"
                        onClick={() => setDeleteCandidate(product)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No products match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}

      {deleteCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete product?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This will permanently remove <span className="font-medium text-slate-900">{deleteCandidate.name}</span> from the catalog and storefront.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setDeleteCandidate(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
                onClick={() => void deleteProduct(deleteCandidate)}
              >
                Delete product
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
