"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ContentPreview } from "@/components/admin/content-preview";
import type { BlogPostRecord, PageRecord } from "@/lib/admin-data";
import { VisualBlockBuilder } from "@/components/admin/visual-block-builder";

type Props = {
  pages: PageRecord[];
  posts: BlogPostRecord[];
};

type Mode = "page" | "post";

type EditorRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyText: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  seoKeywordsText: string;
  canonicalUrl: string;
  coverImageUrl: string;
  authorName: string;
  publishedAt: string;
};

const emptyRecord: EditorRecord = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  bodyText: "[]",
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  seoKeywordsText: "",
  canonicalUrl: "",
  coverImageUrl: "",
  authorName: "",
  publishedAt: "",
};

export function ContentStudio({ pages, posts }: Props) {
  const [mode, setMode] = useState<Mode>("page");
  const [selectedId, setSelectedId] = useState<string>(pages[0]?.id ?? "");
  const [editor, setEditor] = useState(emptyRecord);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [advancedMode, setAdvancedMode] = useState(false);

  const records = mode === "page" ? pages : posts;

  const selected = useMemo<EditorRecord | null>(() => {
    const record = records.find((item) => item.id === selectedId);
    if (!record) return null;
    return {
      id: record.id,
      title: record.title,
      slug: record.slug,
      excerpt: record.excerpt ?? "",
      bodyText: JSON.stringify(record.body ?? [], null, 2),
      status: record.status,
      seoTitle: record.seoTitle ?? "",
      seoDescription: record.seoDescription ?? "",
      seoKeywordsText: record.seoKeywords.join(", "),
      canonicalUrl: record.canonicalUrl ?? "",
      coverImageUrl: "coverImageUrl" in record ? String(record.coverImageUrl ?? "") : "",
      authorName: "authorName" in record ? String(record.authorName ?? "") : "",
      publishedAt: "publishedAt" in record ? String(record.publishedAt ?? "") : "",
    };
  }, [records, selectedId]);

  const activeRecord = selected ? { ...selected, ...editor } : editor;

  useEffect(() => {
    if (selected) {
      setEditor(selected);
    }
    if (!selected && !selectedId) {
      setEditor(emptyRecord);
    }
  }, [selected, selectedId]);

  async function saveRecord() {
    const endpoint = mode === "page" ? "/api/admin/content/pages" : "/api/admin/content/posts";
    const hasId = Boolean(activeRecord.id);
    let parsedBody: unknown = [];
    try {
      parsedBody = JSON.parse(activeRecord.bodyText || "[]");
    } catch {
      setMessage("Content JSON is invalid. Please fix the body blocks before saving.");
      return;
    }
    const response = await fetch(hasId ? `${endpoint}/${activeRecord.id}` : endpoint, {
      method: hasId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: activeRecord.title,
        slug: activeRecord.slug,
        excerpt: activeRecord.excerpt,
        body: parsedBody,
        status: activeRecord.status,
        seoTitle: activeRecord.seoTitle,
        seoDescription: activeRecord.seoDescription,
        seoKeywords: activeRecord.seoKeywordsText.split(",").map((value) => value.trim()).filter(Boolean),
        canonicalUrl: activeRecord.canonicalUrl,
        coverImageUrl: activeRecord.coverImageUrl,
        authorName: activeRecord.authorName,
        publishedAt: activeRecord.publishedAt || null,
      }),
    });
    const body = await response.json();
    setMessage(response.ok ? `${mode === "page" ? "Page" : "Post"} saved.` : body.error || "Failed to save content.");
    if (response.ok) window.location.reload();
  }

  async function deleteRecord() {
    if (!activeRecord.id) return;
    const endpoint = mode === "page" ? `/api/admin/content/pages/${activeRecord.id}` : `/api/admin/content/posts/${activeRecord.id}`;
    const response = await fetch(endpoint, { method: "DELETE" });
    const body = await response.json();
    setMessage(response.ok ? `${mode === "page" ? "Page" : "Post"} deleted.` : body.error || "Failed to delete content.");
    if (response.ok) window.location.reload();
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[320px_minmax(0,1fr)_420px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={`rounded-2xl px-4 py-3 text-sm ${mode === "page" ? "bg-brand-brown text-white" : "bg-[#fcfaf5] text-brand-warm"}`} onClick={() => setMode("page")}>
            Pages
          </button>
          <button type="button" className={`rounded-2xl px-4 py-3 text-sm ${mode === "post" ? "bg-brand-brown text-white" : "bg-[#fcfaf5] text-brand-warm"}`} onClick={() => setMode("post")}>
            Blog posts
          </button>
        </div>
        <button
          type="button"
          className="brand-btn-outline w-full justify-center px-4 py-3"
          onClick={() => {
            setSelectedId("");
            setEditor({ ...emptyRecord });
          }}
        >
          Create new {mode}
        </button>
        <div className="space-y-3">
          {records.map((record) => (
            <button key={record.id} type="button" onClick={() => setSelectedId(record.id)} className={`w-full rounded-2xl border p-4 text-left ${selectedId === record.id ? "border-brand-gold bg-white" : "border-brand-sand/40 bg-[#fcfaf5]"}`}>
              <div className="font-medium text-brand-brown">{record.title}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{record.slug}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="brand-input" value={activeRecord.title} onChange={(event) => setEditor((current) => ({ ...current, title: event.target.value }))} placeholder="Title" />
          <input className="brand-input" value={activeRecord.slug} onChange={(event) => setEditor((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug" />
        </div>
        <textarea className="brand-input min-h-24" value={activeRecord.excerpt} onChange={(event) => setEditor((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Excerpt" />
        {mode === "post" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <input className="brand-input" value={activeRecord.authorName} onChange={(event) => setEditor((current) => ({ ...current, authorName: event.target.value }))} placeholder="Author name" />
            <input className="brand-input" value={activeRecord.coverImageUrl} onChange={(event) => setEditor((current) => ({ ...current, coverImageUrl: event.target.value }))} placeholder="Cover image URL" />
          </div>
        ) : null}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-brown">Visual section composer</p>
              <p className="text-xs text-brand-taupe">Build pages from reusable visual sections. Raw JSON is now only for advanced fallback editing.</p>
            </div>
            <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => setAdvancedMode((current) => !current)}>
              {advancedMode ? "Hide raw JSON" : "Show raw JSON"}
            </button>
          </div>
          <VisualBlockBuilder bodyText={activeRecord.bodyText} onChange={(next) => setEditor((current) => ({ ...current, bodyText: next }))} />
          {advancedMode ? (
            <textarea className="brand-input min-h-[220px] font-mono text-xs" value={activeRecord.bodyText} onChange={(event) => setEditor((current) => ({ ...current, bodyText: event.target.value }))} placeholder="JSON content blocks" />
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="brand-input" value={activeRecord.seoTitle} onChange={(event) => setEditor((current) => ({ ...current, seoTitle: event.target.value }))} placeholder="SEO title" />
          <input className="brand-input" value={activeRecord.seoKeywordsText} onChange={(event) => setEditor((current) => ({ ...current, seoKeywordsText: event.target.value }))} placeholder="SEO keywords" />
        </div>
        <textarea className="brand-input min-h-24" value={activeRecord.seoDescription} onChange={(event) => setEditor((current) => ({ ...current, seoDescription: event.target.value }))} placeholder="SEO description" />
        <div className="flex flex-wrap gap-3">
          <button type="button" className="brand-btn-primary" disabled={isPending} onClick={() => startTransition(async () => void saveRecord())}>
            {isPending ? "Saving..." : `Save ${mode}`}
          </button>
          {activeRecord.id ? (
            <button type="button" className="brand-btn-outline border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white" disabled={isPending} onClick={() => startTransition(async () => void deleteRecord())}>
              Delete
            </button>
          ) : null}
        </div>
        {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
      </div>

      <div className="2xl:sticky 2xl:top-6 2xl:self-start">
        <ContentPreview
          mode={mode}
          title={activeRecord.title}
          slug={activeRecord.slug}
          excerpt={activeRecord.excerpt}
          bodyText={activeRecord.bodyText}
          coverImageUrl={activeRecord.coverImageUrl}
          authorName={activeRecord.authorName}
          publishedAt={activeRecord.publishedAt}
          seoTitle={activeRecord.seoTitle}
          seoDescription={activeRecord.seoDescription}
        />
      </div>
    </div>
  );
}
