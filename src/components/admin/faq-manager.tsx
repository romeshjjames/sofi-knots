"use client";

import { useMemo, useState } from "react";
import { PencilLine, Search, Trash2 } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { FaqRecord, FaqStatus } from "@/types/faqs";

type FaqManagerProps = {
  faqs: FaqRecord[];
};

const emptyDraft = {
  id: null,
  question: "",
  answer: "",
  category: "General",
  displayOrder: 1,
  status: "active" as FaqStatus,
};

export function FaqManager({ faqs }: FaqManagerProps) {
  const [items, setItems] = useState(faqs);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FaqStatus | "all">("all");
  const [draft, setDraft] = useState<{ id: string | null; question: string; answer: string; category: string; displayOrder: number; status: FaqStatus }>(emptyDraft);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<FaqRecord | null>(null);

  const visibleFaqs = useMemo(
    () =>
      [...items]
        .filter((item) => {
          const q = query.trim().toLowerCase();
          const matchesQuery = !q || [item.question, item.answer, item.category].join(" ").toLowerCase().includes(q);
          const matchesStatus = statusFilter === "all" || item.status === statusFilter;
          return matchesQuery && matchesStatus;
        })
        .sort((left, right) => left.displayOrder - right.displayOrder),
    [items, query, statusFilter],
  );

  async function saveFaq() {
    setMessage(null);
    const payload = {
      question: draft.question.trim(),
      answer: draft.answer.trim(),
      category: draft.category.trim() || "General",
      displayOrder: Number(draft.displayOrder) || 1,
      status: draft.status,
    };

    if (!payload.question || !payload.answer) {
      setMessage("Question and answer are required.");
      return;
    }

    const isEditing = Boolean(draft.id);
    const response = await fetch(isEditing ? `/api/admin/faqs/${draft.id}` : "/api/admin/faqs", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();

    if (!response.ok) {
      setMessage(body.error || "Failed to save FAQ.");
      return;
    }

    window.location.reload();
  }

  async function removeFaq() {
    if (!deleteCandidate) return;
    const response = await fetch(`/api/admin/faqs/${deleteCandidate.id}`, { method: "DELETE" });
    const body = await response.json();

    if (!response.ok) {
      setMessage(body.error || "Failed to delete FAQ.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== deleteCandidate.id));
    setDeleteCandidate(null);
    setMessage(`Deleted "${deleteCandidate.question}".`);
  }

  function startCreate() {
    const nextOrder = items.length ? Math.max(...items.map((item) => item.displayOrder)) + 1 : 1;
    setDraft({ ...emptyDraft, displayOrder: nextOrder });
    setMessage(null);
  }

  function startEdit(item: FaqRecord) {
    setDraft({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
      displayOrder: item.displayOrder,
      status: item.status,
    });
    setMessage(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[24px] border border-[#e7eaee] bg-white">
        <div className="border-b border-[#eef1f4] px-5 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
              <Search size={16} className="text-slate-400" />
              <input
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search question, answer, or category"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              className="min-w-[150px] rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FaqStatus | "all")}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbfcfd] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleFaqs.map((item) => (
                <tr key={item.id} className="border-t border-[#eef1f4] bg-white">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{item.question}</div>
                    <div className="mt-1 line-clamp-2 max-w-[420px] text-xs text-slate-500">{item.answer}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.category}</td>
                  <td className="px-4 py-3 text-slate-700">{item.displayOrder}</td>
                  <td className="px-4 py-3">
                    <AdminBadge tone={item.status === "active" ? "success" : "warning"}>{item.status}</AdminBadge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        title="Edit FAQ"
                        onClick={() => startEdit(item)}
                      >
                        <PencilLine size={16} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f0d4d4] text-rose-600 transition hover:bg-rose-50"
                        title="Delete FAQ"
                        onClick={() => setDeleteCandidate(item)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleFaqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                    No FAQs match the current search or filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e7eaee] bg-white p-6">
        <h2 className="font-serif text-2xl text-slate-950">{draft.id ? "Edit FAQ" : "Add FAQ"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create, update, and organize FAQs shown on the live FAQ page.
        </p>
        <div className="mt-5 grid gap-4">
          <input
            className="rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
            placeholder="Question"
            value={draft.question}
            onChange={(event) => setDraft((current) => ({ ...current, question: event.target.value }))}
          />
          <textarea
            className="min-h-36 rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
            placeholder="Answer"
            value={draft.answer}
            onChange={(event) => setDraft((current) => ({ ...current, answer: event.target.value }))}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <input
              className="rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              placeholder="Category"
              value={draft.category}
              onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
            />
            <input
              className="rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              type="number"
              min={1}
              placeholder="Display order"
              value={draft.displayOrder}
              onChange={(event) => setDraft((current) => ({ ...current, displayOrder: Number(event.target.value) || 1 }))}
            />
            <select
              className="rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
              value={draft.status}
              onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as FaqStatus }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              onClick={() => void saveFaq()}
            >
              Save FAQ
            </button>
            <button
              type="button"
              className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={startCreate}
            >
              Reset
            </button>
          </div>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </div>
      </div>

      {deleteCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete FAQ?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">This FAQ will be removed from admin and no longer appear on the website.</p>
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
                onClick={() => void removeFaq()}
              >
                Delete FAQ
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
