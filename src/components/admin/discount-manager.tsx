"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, PencilLine, Percent, Search, Trash2, TicketPlus } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { DiscountStatus, DiscountSummary, DiscountType } from "@/types/discounts";

type DiscountManagerProps = {
  discounts: DiscountSummary[];
};

const statusOptions: { value: DiscountStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
  { value: "expired", label: "Expired" },
];

const typeOptions: { value: DiscountType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed amount" },
  { value: "free_shipping", label: "Free shipping" },
  { value: "buy_x_get_y", label: "Buy X Get Y" },
];

function statusTone(status: DiscountStatus) {
  if (status === "active") return "success";
  if (status === "scheduled") return "info";
  if (status === "expired") return "danger";
  return "warning";
}

function formatType(type: DiscountType) {
  return type.replace(/_/g, " ");
}

export function DiscountManager({ discounts }: DiscountManagerProps) {
  const [items, setItems] = useState(discounts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DiscountStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<DiscountType | "all">("all");
  const [sortBy, setSortBy] = useState("updated");
  const [deleteCandidate, setDeleteCandidate] = useState<DiscountSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleDiscounts = useMemo(
    () =>
      [...items]
        .filter((discount) => {
          const q = query.toLowerCase();
          const matchesQuery =
            !q ||
            discount.code.toLowerCase().includes(q) ||
            discount.title.toLowerCase().includes(q) ||
            discount.appliesTo.toLowerCase().includes(q) ||
            formatType(discount.type).includes(q);
          const matchesStatus = statusFilter === "all" || discount.status === statusFilter;
          const matchesType = typeFilter === "all" || discount.type === typeFilter;
          return matchesQuery && matchesStatus && matchesType;
        })
        .sort((left, right) => {
          if (sortBy === "code") return left.code.localeCompare(right.code);
          if (sortBy === "usage") return right.usageCount - left.usageCount;
          if (sortBy === "impact") return right.revenueImpactInr - left.revenueImpactInr;
          return new Date(right.updatedAt ?? 0).getTime() - new Date(left.updatedAt ?? 0).getTime();
        }),
    [items, query, sortBy, statusFilter, typeFilter],
  );

  async function removeDiscount() {
    if (!deleteCandidate) return;
    const response = await fetch(`/api/admin/discounts/${deleteCandidate.id}`, {
      method: "DELETE",
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to delete discount.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setMessage(`Deleted ${deleteCandidate.code}.`);
    setDeleteCandidate(null);
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
                placeholder="Search by code, title, type, or applicability"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as DiscountStatus | "all")}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as DiscountType | "all")}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="updated">Sort by updated</option>
              <option value="code">Sort by code</option>
              <option value="usage">Sort by usage</option>
              <option value="impact">Sort by impact</option>
            </select>
            <Link
              href="/admin/discounts/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <TicketPlus size={16} />
              Create discount
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{visibleDiscounts.length} discounts</span>
            <span>Use scheduled offers, customer targeting, and product-specific rules to mirror Shopify-style discount workflows.</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Eligibility</th>
                <th className="px-4 py-3 font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleDiscounts.map((discount) => (
                <tr key={discount.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{discount.code}</div>
                    <div className="mt-1 text-xs text-slate-500">{discount.title}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="inline-flex items-center gap-2">
                      <Percent size={14} className="text-slate-400" />
                      <span className="capitalize">{formatType(discount.type)}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{discount.value}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{discount.appliesTo}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {discount.minimumOrderAmountInr ? `Min Rs. ${discount.minimumOrderAmountInr.toLocaleString("en-IN")}` : "No minimum"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{discount.usageCount}{discount.usageLimit ? ` / ${discount.usageLimit}` : ""}</div>
                    <div className="mt-1 text-xs text-slate-500">{discount.orderCount} orders</div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={statusTone(discount.status)}>{discount.status}</AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {discount.updatedAt ? new Date(discount.updatedAt).toLocaleDateString("en-IN") : "Not saved yet"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/discounts/${discount.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Edit ${discount.code}`}
                        title="Edit discount"
                      >
                        <PencilLine size={16} />
                      </Link>
                      <Link
                        href={`/admin/discounts/${discount.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Open ${discount.code}`}
                        title="Open discount"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50"
                        aria-label={`Delete ${discount.code}`}
                        title="Delete discount"
                        onClick={() => setDeleteCandidate(discount)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">
                    No discounts match the current search or filters.
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
            <h3 className="text-xl font-semibold text-slate-900">Delete discount?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the discount and it will no longer be available at checkout. Past orders that used the discount remain for reporting.
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
                onClick={() => void removeDiscount()}
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
