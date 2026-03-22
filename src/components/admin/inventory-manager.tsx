"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Eye, PencilLine, Search, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { InventoryRecord, InventoryStatus } from "@/types/inventory";

const statusOptions: { value: InventoryStatus | "all"; label: string }[] = [
  { value: "all", label: "All stock" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
  { value: "not_tracked", label: "Not tracked" },
];

function statusTone(status: InventoryStatus) {
  if (status === "in_stock") return "success";
  if (status === "low_stock") return "warning";
  if (status === "out_of_stock") return "danger";
  return "default";
}

function statusLabel(status: InventoryStatus) {
  return status.replace(/_/g, " ");
}

export function InventoryManager({ records }: { records: InventoryRecord[] }) {
  const [items, setItems] = useState(records);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "all">("all");
  const [sortBy, setSortBy] = useState("updated");
  const [deleteCandidate, setDeleteCandidate] = useState<InventoryRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleItems = useMemo(
    () =>
      [...items]
        .filter((item) => {
          const q = query.toLowerCase();
          const matchesQuery =
            !q ||
            item.productName.toLowerCase().includes(q) ||
            item.sku.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.collection.toLowerCase().includes(q);
          const matchesStatus = statusFilter === "all" || item.stockStatus === statusFilter;
          return matchesQuery && matchesStatus;
        })
        .sort((left, right) => {
          if (sortBy === "stock") return right.availableStock - left.availableStock;
          if (sortBy === "name") return left.productName.localeCompare(right.productName);
          return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
        }),
    [items, query, sortBy, statusFilter],
  );

  async function clearInventory(item: InventoryRecord) {
    const response = await fetch(`/api/admin/inventory/${item.productId}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to clear inventory record.");
      return;
    }
    setItems((current) => current.filter((entry) => entry.productId !== item.productId));
    setDeleteCandidate(null);
    setMessage(`Cleared inventory record for ${item.productName}.`);
  }

  const lowStock = items.filter((item) => item.stockStatus === "low_stock" || item.stockStatus === "out_of_stock").slice(0, 4);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div className="rounded-[24px] border border-[#e7eaee] bg-white">
          <div className="border-b border-[#eef1f4] px-5 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
                <Search size={16} className="text-slate-400" />
                <input
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Search by product, SKU, category, or collection"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <select className="min-w-[160px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InventoryStatus | "all")}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="updated">Sort by updated</option>
                <option value="stock">Sort by stock</option>
                <option value="name">Sort by name</option>
              </select>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{visibleItems.length} inventory records</span>
              <span>Open a stock record to adjust quantity, update settings, or manage variant inventory.</span>
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbfcfd] text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Available</th>
                  <th className="px-4 py-3 font-medium">Incoming</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.productId} className="border-t border-[#eef1f4] bg-white">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.productName}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.category} • {item.collection}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.sku || "Not set"}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.availableStock}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.hasVariants ? `${item.variantCount} variants` : "Base stock"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.incomingStock}</td>
                    <td className="px-4 py-3">
                      <AdminBadge tone={statusTone(item.stockStatus)}>{statusLabel(item.stockStatus)}</AdminBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/inventory/${item.productId}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Edit inventory for ${item.productName}`} title="Edit inventory">
                          <PencilLine size={16} />
                        </Link>
                        <Link href={`/product/${item.productSlug}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Preview ${item.productName}`} title="Preview product">
                          <Eye size={16} />
                        </Link>
                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50" aria-label={`Clear inventory for ${item.productName}`} title="Clear inventory record" onClick={() => setDeleteCandidate(item)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                      No inventory records match the current search or filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Low stock alerts</h3>
          <div className="mt-4 space-y-3">
            {lowStock.length ? lowStock.map((item) => (
              <Link key={item.productId} href={`/admin/inventory/${item.productId}`} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4 text-sm text-slate-600 transition hover:bg-white">
                <AlertTriangle size={18} className="mt-0.5 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-900">{item.productName}</p>
                  <p className="mt-1">Available: {item.availableStock} • Safety stock: {item.safetyStock} • Incoming: {item.incomingStock}</p>
                </div>
              </Link>
            )) : (
              <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">
                No low stock alerts right now.
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Clear inventory record?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This sets stock to zero and stops tracking the base inventory record for <span className="font-medium text-slate-900">{deleteCandidate.productName}</span>.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={() => void clearInventory(deleteCandidate)}>
                Clear record
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
