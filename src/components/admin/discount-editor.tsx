"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Save, Trash2, X } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import { buildDiscountValueLabel, deriveDiscountStatus } from "@/lib/discounts";
import type {
  DiscountCustomerEligibility,
  DiscountDetail,
  DiscountEligibility,
  DiscountStatus,
  DiscountType,
} from "@/types/discounts";

type SupportOption = { id: string; label: string };

type DiscountEditorProps = {
  discount?: DiscountDetail | null;
  mode: "create" | "edit";
  products: SupportOption[];
  collections: SupportOption[];
  customers: SupportOption[];
};

const customerTagOptions = ["VIP", "Repeat customer", "Wholesale", "Custom order client", "Premium buyer"];

function emptyDiscount(): DiscountDetail {
  return {
    id: `discount_${Date.now()}`,
    code: "",
    title: "",
    automaticName: "",
    type: "percentage",
    value: "",
    minimumOrderAmountInr: null,
    usageLimit: null,
    usageCount: 0,
    oneUsePerCustomer: false,
    combinable: false,
    startsAt: null,
    endsAt: null,
    status: "draft",
    eligibility: "all_products",
    customerEligibility: "all_customers",
    eligibleProducts: [],
    eligibleCollections: [],
    eligibleCustomers: [],
    eligibleCustomerTags: [],
    appliesTo: "All products",
    revenueImpactInr: 0,
    orderCount: 0,
    updatedAt: null,
  };
}

function emptyDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoString(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function toggleSelection(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function buildAppliesTo(discount: DiscountDetail, products: SupportOption[], collections: SupportOption[]) {
  if (discount.eligibility === "specific_products") {
    if (!discount.eligibleProducts.length) return "Specific products";
    const labels = products.filter((item) => discount.eligibleProducts.includes(item.id)).slice(0, 2).map((item) => item.label);
    return labels.length ? labels.join(", ") : `Products (${discount.eligibleProducts.length})`;
  }
  if (discount.eligibility === "specific_collections") {
    if (!discount.eligibleCollections.length) return "Specific collections";
    const labels = collections.filter((item) => discount.eligibleCollections.includes(item.id)).slice(0, 2).map((item) => item.label);
    return labels.length ? labels.join(", ") : `Collections (${discount.eligibleCollections.length})`;
  }
  return "All products";
}

export function DiscountEditor({ discount, mode, products, collections, customers }: DiscountEditorProps) {
  const initial = discount ?? emptyDiscount();
  const [editor, setEditor] = useState<DiscountDetail>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentStatus = useMemo(
    () => deriveDiscountStatus({ startsAt: editor.startsAt, endsAt: editor.endsAt, status: editor.status }),
    [editor.endsAt, editor.startsAt, editor.status],
  );

  const valuePreview = useMemo(() => buildDiscountValueLabel(editor.type, editor.value || "0"), [editor.type, editor.value]);

  function updateField<K extends keyof DiscountDetail>(field: K, value: DiscountDetail[K]) {
    setEditor((current) => ({ ...current, [field]: value }));
  }

  function saveDiscount(nextStatus?: DiscountStatus) {
    setMessage(null);
    startTransition(async () => {
      const payload: DiscountDetail = {
        ...editor,
        code: editor.code.trim().toUpperCase(),
        title: editor.title.trim() || editor.code.trim().toUpperCase(),
        automaticName: editor.automaticName.trim() || editor.title.trim() || editor.code.trim().toUpperCase(),
        value: editor.value.trim(),
        status: deriveDiscountStatus({
          startsAt: editor.startsAt,
          endsAt: editor.endsAt,
          status: nextStatus ?? editor.status,
        }),
        appliesTo: buildAppliesTo(editor, products, collections),
      };

      const response = await fetch(mode === "create" ? "/api/admin/discounts" : `/api/admin/discounts/${editor.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save discount.");
        return;
      }

      if (mode === "create") {
        window.location.href = `/admin/discounts/${payload.id}`;
        return;
      }

      setEditor(payload);
      setMessage("Discount saved successfully.");
      window.location.reload();
    });
  }

  function deleteDiscount() {
    if (mode !== "edit") return;
    startTransition(async () => {
      const response = await fetch(`/api/admin/discounts/${editor.id}`, {
        method: "DELETE",
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to delete discount.");
        return;
      }
      window.location.href = "/admin/discounts";
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{mode === "create" ? "Create discount" : "Edit discount"}</div>
              <h2 className="mt-2 font-serif text-2xl text-slate-950">{editor.title || editor.code || "New discount"}</h2>
            </div>
            <AdminBadge tone={currentStatus === "active" ? "success" : currentStatus === "scheduled" ? "info" : currentStatus === "expired" ? "danger" : "warning"}>
              {currentStatus}
            </AdminBadge>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Discount setup</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="brand-input" placeholder="Discount code" value={editor.code} onChange={(event) => updateField("code", event.target.value.toUpperCase())} />
            <input className="brand-input" placeholder="Discount title" value={editor.title} onChange={(event) => updateField("title", event.target.value)} />
            <input className="brand-input md:col-span-2" placeholder="Automatic discount name" value={editor.automaticName} onChange={(event) => updateField("automaticName", event.target.value)} />
            <select className="brand-input" value={editor.type} onChange={(event) => updateField("type", event.target.value as DiscountType)}>
              <option value="percentage">Percentage discount</option>
              <option value="fixed">Fixed amount discount</option>
              <option value="free_shipping">Free shipping</option>
              <option value="buy_x_get_y">Buy X Get Y</option>
            </select>
            <input className="brand-input" placeholder="Discount value" value={editor.value} onChange={(event) => updateField("value", event.target.value)} />
            <input
              className="brand-input"
              type="number"
              min="0"
              placeholder="Minimum order amount"
              value={editor.minimumOrderAmountInr ?? ""}
              onChange={(event) => updateField("minimumOrderAmountInr", event.target.value ? Number(event.target.value) : null)}
            />
            <input
              className="brand-input"
              type="number"
              min="0"
              placeholder="Usage limit"
              value={editor.usageLimit ?? ""}
              onChange={(event) => updateField("usageLimit", event.target.value ? Number(event.target.value) : null)}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Usage conditions</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              One use per customer
              <input type="checkbox" checked={editor.oneUsePerCustomer} onChange={(event) => updateField("oneUsePerCustomer", event.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              Combine with other discounts
              <input type="checkbox" checked={editor.combinable} onChange={(event) => updateField("combinable", event.target.checked)} />
            </label>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Start date</p>
              <input className="brand-input mt-3" type="datetime-local" value={emptyDateTimeLocal(editor.startsAt)} onChange={(event) => updateField("startsAt", toIsoString(event.target.value))} />
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">End date</p>
              <input className="brand-input mt-3" type="datetime-local" value={emptyDateTimeLocal(editor.endsAt)} onChange={(event) => updateField("endsAt", toIsoString(event.target.value))} />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Applicability</h3>
          <div className="mt-4 grid gap-4">
            <select className="brand-input" value={editor.eligibility} onChange={(event) => updateField("eligibility", event.target.value as DiscountEligibility)}>
              <option value="all_products">All products</option>
              <option value="specific_products">Specific products</option>
              <option value="specific_collections">Specific collections</option>
            </select>

            {editor.eligibility === "specific_products" ? (
              <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
                <div className="mb-3 text-sm font-medium text-slate-900">Eligible products</div>
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className={`rounded-full border px-3 py-2 text-sm ${editor.eligibleProducts.includes(product.id) ? "border-[#b98d45] bg-[#fff7ea] text-[#8a6526]" : "border-[#e7eaee] bg-white text-slate-700"}`}
                      onClick={() => updateField("eligibleProducts", toggleSelection(editor.eligibleProducts, product.id))}
                    >
                      {product.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {editor.eligibility === "specific_collections" ? (
              <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
                <div className="mb-3 text-sm font-medium text-slate-900">Eligible collections</div>
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      type="button"
                      className={`rounded-full border px-3 py-2 text-sm ${editor.eligibleCollections.includes(collection.id) ? "border-[#b98d45] bg-[#fff7ea] text-[#8a6526]" : "border-[#e7eaee] bg-white text-slate-700"}`}
                      onClick={() => updateField("eligibleCollections", toggleSelection(editor.eligibleCollections, collection.id))}
                    >
                      {collection.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Customer eligibility</h3>
          <div className="mt-4 grid gap-4">
            <select className="brand-input" value={editor.customerEligibility} onChange={(event) => updateField("customerEligibility", event.target.value as DiscountCustomerEligibility)}>
              <option value="all_customers">All customers</option>
              <option value="specific_tags">Specific customer segments</option>
              <option value="specific_customers">Specific customers</option>
            </select>

            {editor.customerEligibility === "specific_tags" ? (
              <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
                <div className="mb-3 text-sm font-medium text-slate-900">Eligible tags</div>
                <div className="flex flex-wrap gap-2">
                  {customerTagOptions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`rounded-full border px-3 py-2 text-sm ${editor.eligibleCustomerTags.includes(tag) ? "border-[#b98d45] bg-[#fff7ea] text-[#8a6526]" : "border-[#e7eaee] bg-white text-slate-700"}`}
                      onClick={() => updateField("eligibleCustomerTags", toggleSelection(editor.eligibleCustomerTags, tag))}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {editor.customerEligibility === "specific_customers" ? (
              <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
                <div className="mb-3 text-sm font-medium text-slate-900">Eligible customers</div>
                <div className="flex flex-wrap gap-2">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className={`rounded-full border px-3 py-2 text-sm ${editor.eligibleCustomers.includes(customer.id) ? "border-[#b98d45] bg-[#fff7ea] text-[#8a6526]" : "border-[#e7eaee] bg-white text-slate-700"}`}
                      onClick={() => updateField("eligibleCustomers", toggleSelection(editor.eligibleCustomers, customer.id))}
                    >
                      {customer.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              disabled={isPending}
              onClick={() => saveDiscount("active")}
            >
              <Save size={15} />
              {isPending ? "Saving..." : "Save discount"}
            </button>
            <button
              type="button"
              className="rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              disabled={isPending}
              onClick={() => saveDiscount("draft")}
            >
              Save as draft
            </button>
            <Link href="/admin/discounts" className="inline-flex items-center rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </Link>
            {mode === "edit" ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 size={15} />
                Delete discount
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setEditor(emptyDiscount())}
              >
                <X size={15} />
                Reset
              </button>
            )}
          </div>
          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Summary</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Discount type</div>
              <div className="mt-2 text-base font-medium capitalize text-slate-900">{editor.type.replace(/_/g, " ")}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Customer sees</div>
              <div className="mt-2 text-base font-medium text-slate-900">{valuePreview}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Applies to</div>
              <div className="mt-2 text-base font-medium text-slate-900">{buildAppliesTo(editor, products, collections)}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Customer eligibility</div>
              <div className="mt-2 text-base font-medium text-slate-900">{editor.customerEligibility.replace(/_/g, " ")}</div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Usage conditions</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4 text-sm text-slate-700">
              Usage limit: {editor.usageLimit ? editor.usageLimit.toLocaleString("en-IN") : "Unlimited"}
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4 text-sm text-slate-700">
              Minimum purchase: {editor.minimumOrderAmountInr ? `Rs. ${editor.minimumOrderAmountInr.toLocaleString("en-IN")}` : "None"}
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4 text-sm text-slate-700">
              One use per customer: {editor.oneUsePerCustomer ? "Enabled" : "Disabled"}
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4 text-sm text-slate-700">
              Combine with other discounts: {editor.combinable ? "Allowed" : "Not allowed"}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Performance snapshot</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Times used</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">{editor.usageCount}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Orders using this discount</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">{editor.orderCount}</div>
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Revenue impact</div>
              <div className="mt-2 text-xl font-semibold text-slate-900">Rs. {editor.revenueImpactInr.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Schedule preview</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              Starts: {editor.startsAt ? new Date(editor.startsAt).toLocaleString("en-IN") : "Immediately after save"}
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              Ends: {editor.endsAt ? new Date(editor.endsAt).toLocaleString("en-IN") : "No end date"}
            </div>
          </div>
        </section>
      </div>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete discount?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the discount and it can no longer be applied at checkout. Historical orders remain for reporting.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
                onClick={deleteDiscount}
              >
                Delete discount
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
