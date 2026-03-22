"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, FilePlus2, PencilLine, Search, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { PageRecord } from "@/lib/admin-data";

export function PagesManager({ pages }: { pages: PageRecord[] }) {
  const [items, setItems] = useState(pages);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [deleteCandidate, setDeleteCandidate] = useState<PageRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visiblePages = useMemo(
    () =>
      items.filter((page) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || [page.title, page.slug, page.excerpt ?? ""].join(" ").toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || page.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [items, query, statusFilter],
  );

  async function removePage() {
    if (!deleteCandidate) return;
    const response = await fetch(`/api/admin/content/pages/${deleteCandidate.id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to delete page.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setMessage(`Deleted ${deleteCandidate.title}.`);
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
                placeholder="Search title or slug"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <Link
              href="/admin/pages/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              <FilePlus2 size={16} />
              Create page
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{visiblePages.length} pages</span>
            <span>Core storefront pages are provisioned here automatically so Home, Shop, Collections, Blog, and policy pages can all be edited from admin.</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Page</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePages.map((page) => (
                <tr key={page.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900">{page.title}</div>
                      {page.isCoreStorefrontPage ? <AdminBadge tone="info">Core storefront</AdminBadge> : null}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{page.excerpt || "No summary added yet."}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{page.storefrontRoute}</div>
                    <div className="mt-1 text-xs text-slate-500">{page.storefrontLabel}</div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={page.status === "published" ? "success" : "warning"}>{page.status}</AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(page.updatedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        title="Edit page"
                      >
                        <PencilLine size={16} />
                      </Link>
                      <Link
                        href={page.status === "published" ? `/${page.slug}` : page.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        title="Preview page"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50"
                        title="Delete page"
                        onClick={() => setDeleteCandidate(page)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visiblePages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    No pages match the current search or filters.
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
            <h3 className="text-xl font-semibold text-slate-900">Delete page?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This page will be removed from the page library and storefront if it was published.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={() => void removePage()}>
                Delete page
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
