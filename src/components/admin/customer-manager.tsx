"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, PencilLine, Search, Trash2, UserPlus } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { CustomerSummary } from "@/types/customers";

const filterOptions = [
  { value: "all", label: "All customers" },
  { value: "with-orders", label: "With orders" },
  { value: "no-orders", label: "No orders" },
  { value: "repeat", label: "Repeat customers" },
  { value: "tagged", label: "Tagged customers" },
];

export function CustomerManager({ customers }: { customers: CustomerSummary[] }) {
  const [items, setItems] = useState(customers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [deleteCandidate, setDeleteCandidate] = useState<CustomerSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleCustomers = useMemo(
    () =>
      [...items]
        .filter((customer) => {
          const q = query.toLowerCase();
          const matchesQuery =
            !q ||
            customer.fullName.toLowerCase().includes(q) ||
            customer.email.toLowerCase().includes(q) ||
            customer.phone.toLowerCase().includes(q) ||
            customer.tags.some((tag) => tag.toLowerCase().includes(q));
          const matchesFilter =
            filter === "all"
              ? true
              : filter === "with-orders"
                ? customer.orderCount > 0
                : filter === "no-orders"
                  ? customer.orderCount === 0
                  : filter === "repeat"
                    ? customer.orderCount > 1
                    : customer.tags.length > 0;
          return matchesQuery && matchesFilter;
        })
        .sort((left, right) => {
          if (sortBy === "name") return left.fullName.localeCompare(right.fullName);
          if (sortBy === "spent") return right.totalSpentInr - left.totalSpentInr;
          if (sortBy === "orders") return right.orderCount - left.orderCount;
          return new Date(right.joinedAt).getTime() - new Date(left.joinedAt).getTime();
        }),
    [filter, items, query, sortBy],
  );

  async function removeCustomer() {
    if (!deleteCandidate) return;
    const response = await fetch(`/api/admin/customers/${deleteCandidate.id}`, {
      method: "DELETE",
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to delete customer.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setMessage(`Deleted ${deleteCandidate.fullName}.`);
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
                placeholder="Search by name, email, phone, or tag"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="min-w-[180px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={filter} onChange={(event) => setFilter(event.target.value)}>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select className="min-w-[170px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="recent">Newest first</option>
              <option value="name">Name</option>
              <option value="spent">Total spent</option>
              <option value="orders">Orders</option>
            </select>
            <Link href="/admin/customers/new" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              <UserPlus size={16} />
              Add customer
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{visibleCustomers.length} customers</span>
            <span>Use tags like VIP, Repeat customer, Wholesale, or Premium buyer to segment the list.</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total spent</th>
                <th className="px-4 py-3 font-medium">Last order</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{customer.fullName}</div>
                    <div className="mt-1 text-xs text-slate-500">{customer.email}</div>
                    <div className="mt-1 text-xs text-slate-500">{customer.phone || "No phone"}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{customer.orderCount}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">Rs. {customer.totalSpentInr.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN") : "No orders yet"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.length ? customer.tags.map((tag) => (
                        <AdminBadge key={tag} tone={tag === "VIP" ? "success" : "default"}>
                          {tag}
                        </AdminBadge>
                      )) : <span className="text-xs text-slate-400">No tags</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/customers/${customer.id}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Edit ${customer.fullName}`} title="Edit customer">
                        <PencilLine size={16} />
                      </Link>
                      <Link href={`/admin/customers/${customer.id}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" aria-label={`Open ${customer.fullName}`} title="Open customer">
                        <Eye size={16} />
                      </Link>
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50" aria-label={`Delete ${customer.fullName}`} title="Delete customer" onClick={() => setDeleteCandidate(customer)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No customers match the current search or filter.
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
            <h3 className="text-xl font-semibold text-slate-900">Delete customer?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the customer profile. Historical orders may remain for reporting, but the customer record will be deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={() => void removeCustomer()}>
                Delete customer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
