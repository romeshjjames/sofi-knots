"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { ProductVariantRecord } from "@/lib/admin-data";
import type { InventoryAdjustmentReason, InventoryDetail, InventoryStatus } from "@/types/inventory";

const adjustmentReasons: { value: InventoryAdjustmentReason; label: string }[] = [
  { value: "restock", label: "Restock" },
  { value: "damage", label: "Damage" },
  { value: "manual_correction", label: "Manual correction" },
  { value: "return", label: "Return added back to stock" },
  { value: "transfer", label: "Transfer" },
  { value: "cancellation", label: "Order cancellation" },
];

function statusTone(status: InventoryStatus) {
  if (status === "in_stock") return "success";
  if (status === "low_stock") return "warning";
  if (status === "out_of_stock") return "danger";
  return "default";
}

function InventoryVariantsTable({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariantRecord[];
}) {
  const [rows, setRows] = useState(variants);
  const [message, setMessage] = useState<string | null>(null);

  async function saveVariant(row: ProductVariantRecord) {
    const response = await fetch(`/api/admin/products/${productId}/variants/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    const body = await response.json();
    setMessage(response.ok ? "Variant stock saved." : body.error || "Failed to save variant.");
  }

  if (!rows.length) {
    return <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">No variants for this product. Base inventory settings control stock here.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[24px] border border-[#e7eaee]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fbfcfd] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Variant</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[#eef1f4] bg-white">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{row.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {Object.entries(row.attributes).map(([key, value]) => `${key}: ${value}`).join(", ") || "No attributes"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input className="brand-input" value={row.sku ?? ""} onChange={(event) => setRows((current) => current.map((entry) => entry.id === row.id ? { ...entry, sku: event.target.value } : entry))} />
                </td>
                <td className="px-4 py-3">
                  <input className="brand-input max-w-[120px]" type="number" value={row.stockQuantity} onChange={(event) => setRows((current) => current.map((entry) => entry.id === row.id ? { ...entry, stockQuantity: Number(event.target.value) } : entry))} />
                </td>
                <td className="px-4 py-3">
                  <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => void saveVariant(row)}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}

export function InventoryEditor({ record }: { record: InventoryDetail }) {
  const [editor, setEditor] = useState(record);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [adjustmentDelta, setAdjustmentDelta] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState<InventoryAdjustmentReason>("restock");
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const hasVariants = editor.variants.length > 0;

  function updateField<K extends keyof InventoryDetail>(field: K, value: InventoryDetail[K]) {
    setEditor((current) => ({ ...current, [field]: value }));
  }

  function saveInventory() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(`/api/admin/inventory/${editor.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: editor.sku,
          inventoryQuantity: editor.availableStock,
          inventoryTracking: editor.inventoryTracking,
          continueSellingWhenOutOfStock: editor.continueSellingWhenOutOfStock,
          location: editor.location,
          safetyStock: editor.safetyStock,
          incomingStock: editor.incomingStock,
          reservedStock: editor.reservedStock,
        }),
      });
      const body = await response.json();
      setMessage(response.ok ? "Inventory saved successfully." : body.error || "Failed to save inventory.");
      if (response.ok) window.location.reload();
    });
  }

  function applyAdjustment() {
    setMessage(null);
    startTransition(async () => {
      const nextQuantity = Math.max(0, editor.availableStock + adjustmentDelta);
      const response = await fetch(`/api/admin/inventory/${editor.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: editor.sku,
          inventoryQuantity: nextQuantity,
          inventoryTracking: editor.inventoryTracking,
          continueSellingWhenOutOfStock: editor.continueSellingWhenOutOfStock,
          location: editor.location,
          safetyStock: editor.safetyStock,
          incomingStock: editor.incomingStock,
          reservedStock: editor.reservedStock,
          adjustment: {
            delta: adjustmentDelta,
            reason: adjustmentReason,
            note: adjustmentNote,
          },
        }),
      });
      const body = await response.json();
      setMessage(response.ok ? "Inventory adjustment saved." : body.error || "Failed to apply adjustment.");
      if (response.ok) window.location.reload();
    });
  }

  function clearInventory() {
    startTransition(async () => {
      const response = await fetch(`/api/admin/inventory/${editor.productId}`, { method: "DELETE" });
      const body = await response.json();
      setMessage(response.ok ? "Inventory record cleared." : body.error || "Failed to clear inventory.");
      if (response.ok) window.location.href = "/admin/inventory";
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Inventory detail</div>
              <h2 className="mt-2 font-serif text-2xl text-slate-950">{editor.productName}</h2>
            </div>
            <AdminBadge tone={statusTone(editor.stockStatus)}>{editor.stockStatus.replace(/_/g, " ")}</AdminBadge>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Base inventory settings</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="brand-input" placeholder="SKU" value={editor.sku} onChange={(event) => updateField("sku", event.target.value)} />
            <input className="brand-input" placeholder="Location / warehouse" value={editor.location} onChange={(event) => updateField("location", event.target.value)} />
            <input className="brand-input" type="number" placeholder="Available stock" value={editor.availableStock} disabled={hasVariants} onChange={(event) => updateField("availableStock", Number(event.target.value))} />
            <input className="brand-input" type="number" placeholder="Incoming stock" value={editor.incomingStock} onChange={(event) => updateField("incomingStock", Number(event.target.value))} />
            <input className="brand-input" type="number" placeholder="Reserved stock" value={editor.reservedStock} onChange={(event) => updateField("reservedStock", Number(event.target.value))} />
            <input className="brand-input" type="number" placeholder="Safety stock" value={editor.safetyStock} onChange={(event) => updateField("safetyStock", Number(event.target.value))} />
          </div>
          {hasVariants ? <p className="mt-3 text-sm text-slate-500">This product has variants, so sellable stock is controlled below at the variant level. Base stock is read-only here.</p> : null}
          <div className="mt-4 grid gap-3">
            <label className="flex items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={editor.inventoryTracking} onChange={(event) => updateField("inventoryTracking", event.target.checked)} />
              Track quantity
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={editor.continueSellingWhenOutOfStock} onChange={(event) => updateField("continueSellingWhenOutOfStock", event.target.checked)} />
              Continue selling when out of stock
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Stock adjustment</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="brand-input" type="number" value={adjustmentDelta} onChange={(event) => setAdjustmentDelta(Number(event.target.value))} placeholder="Adjustment delta" />
            <select className="brand-input" value={adjustmentReason} onChange={(event) => setAdjustmentReason(event.target.value as InventoryAdjustmentReason)}>
              {adjustmentReasons.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <textarea className="brand-input min-h-24 md:col-span-2" value={adjustmentNote} onChange={(event) => setAdjustmentNote(event.target.value)} placeholder="Reason note or internal explanation" />
          </div>
          <button type="button" className="mt-4 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={isPending || hasVariants} onClick={applyAdjustment}>
            Apply adjustment
          </button>
          {hasVariants ? <p className="mt-3 text-sm text-slate-500">For products with variants, adjust sellable stock in the variant table below.</p> : null}
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Variant inventory</h3>
          <div className="mt-4">
            <InventoryVariantsTable productId={editor.productId} variants={editor.variants} />
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Stock summary</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Available</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{editor.availableStock}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Incoming</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{editor.incomingStock}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Reserved</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{editor.reservedStock}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Variants</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{editor.variantCount}</div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Adjustment history</h3>
          <div className="mt-4 space-y-3">
            {editor.adjustments.length ? editor.adjustments.map((adjustment) => (
              <div key={adjustment.id} className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-900">{adjustment.reason.replace(/_/g, " ")}</div>
                  <div className={`text-sm font-medium ${adjustment.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{adjustment.delta >= 0 ? `+${adjustment.delta}` : adjustment.delta}</div>
                </div>
                <div className="mt-1 text-xs text-slate-500">{new Date(adjustment.createdAt).toLocaleString("en-IN")}</div>
                {adjustment.note ? <p className="mt-2 text-sm text-slate-600">{adjustment.note}</p> : null}
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-4 text-sm text-slate-500">No inventory adjustments logged yet.</div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={isPending} onClick={saveInventory}>
              <Save size={15} />
              {isPending ? "Saving..." : "Save inventory"}
            </button>
            <Link href="/admin/inventory" className="inline-flex items-center rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Back to inventory
            </Link>
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={15} />
              Clear record
            </button>
          </div>
          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </section>
      </div>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Clear inventory record?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This sets the base stock record to zero and disables tracking for this product.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={clearInventory}>
                Clear record
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
