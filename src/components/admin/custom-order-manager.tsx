"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, PencilLine, Search, SquarePen, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { CustomOrderStatus, CustomOrderSummary } from "@/types/custom-orders";

const statusOptions: { value: CustomOrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "new", label: "New" },
  { value: "under_review", label: "Under review" },
  { value: "contacted", label: "Contacted" },
  { value: "awaiting_customer_response", label: "Awaiting response" },
  { value: "quoted", label: "Quoted" },
  { value: "awaiting_approval", label: "Awaiting approval" },
  { value: "approved", label: "Approved" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "delivered", label: "Delivered" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

function statusTone(status: CustomOrderStatus) {
  if (status === "completed" || status === "delivered" || status === "approved") return "success";
  if (status === "rejected" || status === "cancelled") return "danger";
  if (status === "quoted" || status === "awaiting_approval" || status === "contacted") return "info";
  return "warning";
}

function formatStatus(status: CustomOrderStatus) {
  return status.replace(/_/g, " ");
}

export function CustomOrderManager({ customOrders }: { customOrders: CustomOrderSummary[] }) {
  const [items, setItems] = useState(customOrders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomOrderStatus | "all">("all");
  const [sortBy, setSortBy] = useState("recent");
  const [deleteCandidate, setDeleteCandidate] = useState<CustomOrderSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleCustomOrders = useMemo(
    () =>
      [...items]
        .filter((item) => {
          const q = query.toLowerCase();
          const matchesQuery =
            !q ||
            item.customerName.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            item.productType.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q);
          const matchesStatus = statusFilter === "all" || item.status === statusFilter;
          return matchesQuery && matchesStatus;
        })
        .sort((left, right) => {
          if (sortBy === "customer") return left.customerName.localeCompare(right.customerName);
          if (sortBy === "status") return left.status.localeCompare(right.status);
          return new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime();
        }),
    [items, query, sortBy, statusFilter],
  );

  async function removeCustomOrder() {
    if (!deleteCandidate) return;
    const response = await fetch(`/api/admin/custom-orders/${deleteCandidate.id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to delete custom order.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setMessage(`Deleted custom order ${deleteCandidate.id}.`);
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
                placeholder="Search by customer, email, product type, or request ID"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="min-w-[170px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CustomOrderStatus | "all")}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="recent">Newest first</option>
              <option value="customer">Customer</option>
              <option value="status">Status</option>
            </select>
            <Link href="/admin/custom-orders/new" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              <SquarePen size={16} />
              Add custom order
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{visibleCustomOrders.length} custom orders</span>
            <span>Use this workspace to qualify requests, send quotes, track production, and close bespoke client work cleanly.</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Budget / quote</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomOrders.map((item) => (
                <tr key={item.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{item.customerName}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.email}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.phone || "No phone"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-medium text-slate-900">{item.productType}</div>
                    <div className="mt-1 line-clamp-2 max-w-[360px] text-xs text-slate-500">{item.requestSummary}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{item.budget || "No budget provided"}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.estimatedPrice || "No quote yet"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={statusTone(item.status)}>{formatStatus(item.status)}</AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(item.submittedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/custom-orders/${item.id}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Edit ${item.id}`} title="Edit custom order">
                        <PencilLine size={16} />
                      </Link>
                      <Link href={`/admin/custom-orders/${item.id}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Open ${item.id}`} title="Open custom order">
                        <Eye size={16} />
                      </Link>
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50" aria-label={`Delete ${item.id}`} title="Delete custom order" onClick={() => setDeleteCandidate(item)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleCustomOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No custom orders match the current search or filters.
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
            <h3 className="text-xl font-semibold text-slate-900">Delete custom order?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the custom order request from the admin panel.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={() => void removeCustomOrder()}>
                Delete custom order
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
