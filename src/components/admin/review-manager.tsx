"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Eye, MessageSquarePlus, PencilLine, Search, Star, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { ReviewStatus, ReviewSummary } from "@/types/reviews";

const statusOptions: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const ratingOptions = [
  { value: "all", label: "All ratings" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "3", label: "3 stars" },
  { value: "2", label: "2 stars" },
  { value: "1", label: "1 star" },
];

function statusTone(status: ReviewStatus) {
  if (status === "approved") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

function renderStars(count: number) {
  return `${"★".repeat(count)}${"☆".repeat(Math.max(0, 5 - count))}`;
}

export function ReviewManager({ reviews }: { reviews: ReviewSummary[] }) {
  const [items, setItems] = useState(reviews);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [deleteCandidate, setDeleteCandidate] = useState<ReviewSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleReviews = useMemo(
    () =>
      [...items]
        .filter((review) => {
          const q = query.toLowerCase();
          const matchesQuery =
            !q ||
            review.customerName.toLowerCase().includes(q) ||
            review.productName.toLowerCase().includes(q) ||
            review.title.toLowerCase().includes(q) ||
            review.message.toLowerCase().includes(q);
          const matchesStatus = statusFilter === "all" || review.status === statusFilter;
          const matchesRating = ratingFilter === "all" || review.rating === Number(ratingFilter);
          return matchesQuery && matchesStatus && matchesRating;
        })
        .sort((left, right) => {
          if (sortBy === "rating") return right.rating - left.rating;
          if (sortBy === "product") return left.productName.localeCompare(right.productName);
          return new Date(right.reviewDate).getTime() - new Date(left.reviewDate).getTime();
        }),
    [items, query, ratingFilter, sortBy, statusFilter],
  );

  async function removeReview() {
    if (!deleteCandidate) return;
    const response = await fetch(`/api/admin/reviews/${deleteCandidate.id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to delete review.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setMessage(`Deleted review from ${deleteCandidate.customerName}.`);
    setDeleteCandidate(null);
  }

  async function cloneReview(review: ReviewSummary) {
    setMessage(null);
    const response = await fetch(`/api/admin/reviews/${review.id}/clone`, { method: "POST" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to clone review.");
      return;
    }
    window.open(`/admin/reviews/${body.review.id}`, "_blank", "noopener,noreferrer");
    setMessage(`Duplicated review from ${review.customerName}.`);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-[#e7eaee] bg-white">
        <div className="border-b border-[#eef1f4] px-5 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search by customer, product, title, or review text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ReviewStatus | "all")}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select className="min-w-[140px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
              {ratingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="recent">Newest first</option>
              <option value="rating">Highest rating</option>
              <option value="product">Product name</option>
            </select>
            <Link href="/admin/reviews/new" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              <MessageSquarePlus size={16} />
              Add review
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{visibleReviews.length} reviews</span>
            <span>Approve strong reviews for product pages, reject spam, and feature premium testimonials for homepage trust sections.</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleReviews.map((review) => (
                <tr key={review.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{review.customerName}</div>
                    <div className="mt-1 text-xs text-slate-500">{review.title}</div>
                    <div className="mt-1 line-clamp-2 max-w-[340px] text-xs text-slate-500">{review.message}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium text-slate-900">{review.productName}</div>
                    <div className="mt-1 text-xs text-slate-500">{review.productSlug}</div>
                  </td>
                  <td className="px-4 py-3 text-amber-600">
                    <div className="inline-flex items-center gap-2">
                      <Star size={14} className="fill-current" />
                      <span>{renderStars(review.rating)}</span>
                    </div>
                    {review.featuredReview ? <div className="mt-1 text-xs text-slate-500">Featured review</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={statusTone(review.status)}>{review.status}</AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(review.reviewDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/reviews/${review.id}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Edit review from ${review.customerName}`} title="Edit review">
                        <PencilLine size={16} />
                      </Link>
                      <Link href={`/product/${review.productSlug}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Preview ${review.productName}`} title="Preview product page">
                        <Eye size={16} />
                      </Link>
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Clone review from ${review.customerName}`} title="Clone review" onClick={() => void cloneReview(review)}>
                        <Copy size={16} />
                      </button>
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50" aria-label={`Delete review from ${review.customerName}`} title="Delete review" onClick={() => setDeleteCandidate(review)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No reviews match the current search or filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}

      {deleteCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete review?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the review from admin and the storefront. Past order reporting remains unchanged.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={() => void removeReview()}>
                Delete review
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
