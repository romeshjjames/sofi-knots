"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Eye, FilePlus2, PencilLine, Search, Star, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { BlogPostRecord } from "@/lib/admin-data";

export function BlogManager({ posts }: { posts: BlogPostRecord[] }) {
  const [items, setItems] = useState(posts);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "scheduled" | "published">("all");
  const [blogTypeFilter, setBlogTypeFilter] = useState("all");
  const [deleteCandidate, setDeleteCandidate] = useState<BlogPostRecord | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const blogTypes = useMemo(() => Array.from(new Set(items.map((item) => item.blogType))).sort(), [items]);

  const visiblePosts = useMemo(
    () =>
      items.filter((post) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q ||
          [post.title, post.authorName ?? "", post.category, post.blogType, post.tags.join(" "), post.slug].join(" ").toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || post.adminStatus === statusFilter;
        const matchesType = blogTypeFilter === "all" || post.blogType === blogTypeFilter;
        return matchesQuery && matchesStatus && matchesType;
      }),
    [items, query, statusFilter, blogTypeFilter],
  );

  async function removePost() {
    if (!deleteCandidate) return;
    const response = await fetch(`/api/admin/content/posts/${deleteCandidate.id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to delete article.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setMessage(`Deleted ${deleteCandidate.title}.`);
    setDeleteCandidate(null);
  }

  async function clonePost(post: BlogPostRecord) {
    setMessage(null);
    const response = await fetch(`/api/admin/content/posts/${post.id}/clone`, { method: "POST" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to clone article.");
      return;
    }
    window.open(`/admin/blog/${body.post.id}`, "_blank", "noopener,noreferrer");
    setMessage(`Duplicated ${post.title}.`);
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
                placeholder="Search title, author, category, tag, or blog type"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
            <select className="min-w-[160px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none" value={blogTypeFilter} onChange={(event) => setBlogTypeFilter(event.target.value)}>
              <option value="all">All blog types</option>
              {blogTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Link href="/admin/blog/new" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              <FilePlus2 size={16} />
              Add article
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{visiblePosts.length} articles</span>
            <span>Blog content is now managed separately from static pages so editorial work stays cleaner and easier to scan.</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePosts.map((post) => (
                <tr key={post.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{post.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{post.authorName || "No author"} • /blog/{post.slug}</div>
                      </div>
                      {post.featuredArticle ? <Star size={14} className="mt-1 text-[#b98d45]" /> : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{post.blogType}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{post.category}</div>
                    <div className="mt-1 text-xs text-slate-500">{post.tags.join(", ") || "No tags"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={post.adminStatus === "published" ? "success" : post.adminStatus === "scheduled" ? "info" : "warning"}>
                      {post.adminStatus}
                    </AdminBadge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{new Date(post.updatedAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/${post.id}`} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" title="Edit article">
                        <PencilLine size={16} />
                      </Link>
                      <Link href={post.adminStatus === "published" ? `/blog/${post.slug}` : post.previewUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" title="Preview article">
                        <Eye size={16} />
                      </Link>
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900" title="Clone article" onClick={() => void clonePost(post)}>
                        <Copy size={16} />
                      </button>
                      <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50" title="Delete article" onClick={() => setDeleteCandidate(post)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visiblePosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-500">
                    No articles match the current search or filters.
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
            <h3 className="text-xl font-semibold text-slate-900">Delete article?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This article will be removed from the blog library and will no longer appear on the website.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteCandidate(null)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={() => void removePost()}>
                Delete article
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
