"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Save, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { ReviewDetail, ReviewStatus, ReviewSupportOption } from "@/types/reviews";

type ReviewEditorProps = {
  review?: ReviewDetail | null;
  mode: "create" | "edit";
  products: ReviewSupportOption[];
};

function emptyReview(products: ReviewSupportOption[]): ReviewDetail {
  const firstProduct = products[0];
  return {
    id: `review_${Date.now()}`,
    customerName: "",
    customerEmail: "",
    customerInitials: "",
    customerImageUrl: null,
    productId: firstProduct?.id ?? "",
    productName: firstProduct?.label ?? "",
    productSlug: firstProduct?.slug ?? "",
    rating: 5,
    title: "",
    message: "",
    reviewDate: new Date().toISOString().slice(0, 10),
    status: "pending",
    featuredReview: false,
    homepageFeature: false,
    highlightedReview: false,
    updatedAt: null,
  };
}

function statusTone(status: ReviewStatus) {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

function buildInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "SK"
  );
}

export function ReviewEditor({ review, mode, products }: ReviewEditorProps) {
  const [editor, setEditor] = useState<ReviewDetail>(review ?? emptyReview(products));
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === editor.productId) ?? null,
    [editor.productId, products],
  );

  function updateField<K extends keyof ReviewDetail>(field: K, value: ReviewDetail[K]) {
    setEditor((current) => ({ ...current, [field]: value }));
  }

  function saveReview(nextStatus?: ReviewStatus) {
    setMessage(null);
    startTransition(async () => {
      const payload: ReviewDetail = {
        ...editor,
        customerInitials: editor.customerInitials.trim() || buildInitials(editor.customerName),
        productName: selectedProduct?.label ?? editor.productName,
        productSlug: selectedProduct?.slug ?? editor.productSlug,
        status: nextStatus ?? editor.status,
      };

      const response = await fetch(mode === "create" ? "/api/admin/reviews" : `/api/admin/reviews/${editor.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save review.");
        return;
      }

      if (mode === "create") {
        window.location.href = `/admin/reviews/${payload.id}`;
        return;
      }

      setMessage("Review saved successfully.");
      window.location.reload();
    });
  }

  function deleteReview() {
    if (mode !== "edit") return;
    startTransition(async () => {
      const response = await fetch(`/api/admin/reviews/${editor.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to delete review.");
        return;
      }
      window.location.href = "/admin/reviews";
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{mode === "create" ? "Add review" : "Edit review"}</div>
              <h2 className="mt-2 font-serif text-2xl text-slate-950">{editor.title || "New review"}</h2>
            </div>
            <AdminBadge tone={statusTone(editor.status)}>{editor.status}</AdminBadge>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Review details</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input className="brand-input" placeholder="Customer name" value={editor.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
            <input className="brand-input" placeholder="Customer email" value={editor.customerEmail} onChange={(event) => updateField("customerEmail", event.target.value)} />
            <select
              className="brand-input"
              value={editor.productId}
              onChange={(event) => {
                const product = products.find((item) => item.id === event.target.value);
                updateField("productId", event.target.value);
                updateField("productName", product?.label ?? "");
                updateField("productSlug", product?.slug ?? "");
              }}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.label}
                </option>
              ))}
            </select>
            <input className="brand-input" placeholder="Review title" value={editor.title} onChange={(event) => updateField("title", event.target.value)} />
            <select className="brand-input" value={String(editor.rating)} onChange={(event) => updateField("rating", Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value === 1 ? "" : "s"}
                </option>
              ))}
            </select>
            <input className="brand-input" type="date" value={editor.reviewDate} onChange={(event) => updateField("reviewDate", event.target.value)} />
            <input className="brand-input" placeholder="Customer image URL (optional)" value={editor.customerImageUrl ?? ""} onChange={(event) => updateField("customerImageUrl", event.target.value || null)} />
            <input className="brand-input" placeholder="Customer initials" value={editor.customerInitials} onChange={(event) => updateField("customerInitials", event.target.value.toUpperCase())} />
            <select className="brand-input" value={editor.status} onChange={(event) => updateField("status", event.target.value as ReviewStatus)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <textarea className="brand-input min-h-32 md:col-span-2" placeholder="Review message" value={editor.message} onChange={(event) => updateField("message", event.target.value)} />
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Visibility and featuring</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              Featured review
              <input type="checkbox" checked={editor.featuredReview} onChange={(event) => updateField("featuredReview", event.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              Homepage testimonial
              <input type="checkbox" checked={editor.homepageFeature} onChange={(event) => updateField("homepageFeature", event.target.checked)} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              Highlighted review
              <input type="checkbox" checked={editor.highlightedReview} onChange={(event) => updateField("highlightedReview", event.target.checked)} />
            </label>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <div className="flex flex-wrap gap-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800" disabled={isPending} onClick={() => saveReview(editor.status)}>
              <Save size={15} />
              {isPending ? "Saving..." : "Save review"}
            </button>
            <button type="button" className="rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" disabled={isPending} onClick={() => saveReview("pending")}>
              Save as pending
            </button>
            <Link href="/admin/reviews" className="inline-flex items-center rounded-2xl border border-[#d8dde3] px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Cancel
            </Link>
            {mode === "edit" ? (
              <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={15} />
                Delete review
              </button>
            ) : null}
          </div>
          {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Review preview</h3>
          <div className="mt-4 rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1f2933] text-sm font-semibold text-white">
                  {editor.customerInitials || buildInitials(editor.customerName)}
                </div>
                <div>
                  <div className="font-medium text-slate-900">{editor.customerName || "Customer name"}</div>
                  <div className="mt-1 text-xs text-slate-500">{editor.productName || "Linked product"}</div>
                </div>
              </div>
              <div className="text-sm text-amber-600">{`${"★".repeat(editor.rating)}${"☆".repeat(Math.max(0, 5 - editor.rating))}`}</div>
            </div>
            <h4 className="mt-4 text-base font-semibold text-slate-950">{editor.title || "Review title"}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">{editor.message || "The review preview updates here as you write the customer feedback."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {editor.featuredReview ? <AdminBadge tone="success">Featured</AdminBadge> : null}
              {editor.homepageFeature ? <AdminBadge tone="info">Homepage</AdminBadge> : null}
              {editor.highlightedReview ? <AdminBadge tone="default">Highlighted</AdminBadge> : null}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
          <h3 className="text-lg font-semibold text-slate-950">Publishing notes</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              Approved reviews can appear on product pages and premium testimonial slots.
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              Rejected reviews stay in admin records but should not be shown on the storefront.
            </div>
            <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
              Link each review to the correct product so the storefront knows where to display it.
            </div>
          </div>
        </section>

        {selectedProduct ? (
          <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
            <h3 className="text-lg font-semibold text-slate-950">Product link</h3>
            <Link href={`/product/${selectedProduct.slug}`} target="_blank" rel="noreferrer" className="mt-4 block rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4 text-sm text-slate-700 transition hover:bg-white">
              Open {selectedProduct.label} on the storefront
            </Link>
          </section>
        ) : null}
      </div>

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete review?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the review from the admin panel and storefront visibility.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={deleteReview}>
                Delete review
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
