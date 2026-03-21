"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ExternalLink, FileText, LayoutTemplate, Link as LinkIcon, Newspaper, Sparkles } from "lucide-react";
import { ContentPreview } from "@/components/admin/content-preview";
import type { BlogPostRecord, PageRecord } from "@/lib/admin-data";
import { VisualBlockBuilder } from "@/components/admin/visual-block-builder";
import { normalizeVisualBlocks } from "@/lib/cms-blocks";

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
  previewUrl: string;
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
  previewUrl: "",
};

const contentStarters = {
  page: [
    {
      id: "landing",
      label: "Landing page",
      description: "Hero, story section, image spotlight, and CTA.",
      icon: LayoutTemplate,
      body: [
        { type: "heading", content: "Build the campaign headline", level: "h2" },
        { type: "paragraph", content: "Introduce the page with a clear promise and supporting value proposition." },
        { type: "cta", label: "Shop now", href: "/shop", style: "primary" },
        { type: "heading", content: "Tell the deeper story", level: "h2" },
        { type: "paragraph", content: "Use this area for craftsmanship, product education, or campaign narrative." },
        { type: "image", url: "", alt: "Editorial image", caption: "Add a supporting visual" },
      ],
    },
    {
      id: "policy",
      label: "Policy page",
      description: "Simple, readable stack for shipping, care, or returns.",
      icon: FileText,
      body: [
        { type: "heading", content: "Policy title", level: "h2" },
        { type: "paragraph", content: "Start with a short summary that tells visitors what this page covers." },
        { type: "heading", content: "Section heading", level: "h3" },
        { type: "paragraph", content: "Use concise, readable paragraphs for policy details." },
      ],
    },
  ],
  post: [
    {
      id: "editorial",
      label: "Editorial story",
      description: "Long-form post with visual rhythm and quote moments.",
      icon: Newspaper,
      body: [
        { type: "heading", content: "Open with a strong editorial headline", level: "h2" },
        { type: "paragraph", content: "Set up the story with a warm introduction that invites the reader into the post." },
        { type: "image", url: "", alt: "Feature image", caption: "Visual supporting the story" },
        { type: "quote", quote: "Add a memorable founder, customer, or editorial quote here.", cite: "Quote source" },
        { type: "paragraph", content: "Continue the article with practical details, styling ideas, or behind-the-scenes context." },
      ],
    },
    {
      id: "seo-guide",
      label: "SEO guide",
      description: "Useful structure for FAQ, listicle, or search-intent content.",
      icon: Sparkles,
      body: [
        { type: "heading", content: "Guide headline", level: "h2" },
        { type: "paragraph", content: "Begin with a concise answer to the main search intent." },
        { type: "heading", content: "Helpful subtopic", level: "h3" },
        { type: "paragraph", content: "Expand with practical tips, examples, or comparisons." },
        { type: "cta", label: "Browse products", href: "/shop", style: "secondary" },
      ],
    },
  ],
} as const;

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
      previewUrl: "previewUrl" in record ? String(record.previewUrl ?? "") : "",
    };
  }, [records, selectedId]);

  const activeRecord = selected ? { ...selected, ...editor } : editor;
  const normalizedBlocks = useMemo(() => normalizeVisualBlocks(activeRecord.bodyText), [activeRecord.bodyText]);
  const blockCount = normalizedBlocks.length;
  const sectionCount = new Set(normalizedBlocks.map((block) => block.sectionId)).size;
  const seoReady = Boolean(activeRecord.seoTitle && activeRecord.seoDescription);

  useEffect(() => {
    if (selected) {
      setEditor(selected);
    }
    if (!selected && !selectedId) {
      setEditor(emptyRecord);
    }
  }, [selected, selectedId]);

  function applyStarter(templateId: string) {
    const starter = contentStarters[mode].find((entry) => entry.id === templateId);
    if (!starter) return;
    setEditor((current) => ({
      ...current,
      bodyText: JSON.stringify(normalizeVisualBlocks(JSON.stringify(starter.body)), null, 2),
      excerpt: current.excerpt || starter.description,
    }));
    setMessage(`${starter.label} starter applied.`);
  }

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
        <div className="grid gap-3 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Sections</div>
            <div className="mt-2 text-2xl font-medium text-brand-brown">{sectionCount}</div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Blocks</div>
            <div className="mt-2 text-2xl font-medium text-brand-brown">{blockCount}</div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">SEO status</div>
            <div className="mt-2 text-sm font-medium text-brand-brown">{seoReady ? "Ready for preview" : "Needs SEO copy"}</div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="brand-input" value={activeRecord.title} onChange={(event) => setEditor((current) => ({ ...current, title: event.target.value }))} placeholder="Title" />
          <input className="brand-input" value={activeRecord.slug} onChange={(event) => setEditor((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug" />
        </div>
        <textarea className="brand-input min-h-24" value={activeRecord.excerpt} onChange={(event) => setEditor((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Excerpt" />
        <div className="grid gap-4 md:grid-cols-2">
          <select className="brand-input" value={activeRecord.status} onChange={(event) => setEditor((current) => ({ ...current, status: event.target.value as EditorRecord["status"] }))}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input className="brand-input" value={activeRecord.canonicalUrl} onChange={(event) => setEditor((current) => ({ ...current, canonicalUrl: event.target.value }))} placeholder="Canonical URL" />
        </div>
        {activeRecord.previewUrl ? (
          <div className="flex flex-wrap gap-3 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <a href={activeRecord.previewUrl} target="_blank" rel="noreferrer" className="brand-btn-outline px-4 py-2">
              <ExternalLink size={15} />
              Open draft preview
            </a>
            <button
              type="button"
              className="brand-btn-outline px-4 py-2"
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}${activeRecord.previewUrl}`);
                setMessage("Preview link copied.");
              }}
            >
              <LinkIcon size={15} />
              Copy share link
            </button>
          </div>
        ) : null}
        {mode === "post" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <input className="brand-input" value={activeRecord.authorName} onChange={(event) => setEditor((current) => ({ ...current, authorName: event.target.value }))} placeholder="Author name" />
            <input className="brand-input" value={activeRecord.coverImageUrl} onChange={(event) => setEditor((current) => ({ ...current, coverImageUrl: event.target.value }))} placeholder="Cover image URL" />
            <input className="brand-input" type="date" value={activeRecord.publishedAt ? activeRecord.publishedAt.slice(0, 10) : ""} onChange={(event) => setEditor((current) => ({ ...current, publishedAt: event.target.value }))} placeholder="Publish date" />
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
          <div className="grid gap-3 md:grid-cols-2">
            {contentStarters[mode].map((starter) => {
              const Icon = starter.icon;
              return (
                <button key={starter.id} type="button" className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4 text-left transition hover:border-brand-gold/50 hover:bg-white" onClick={() => applyStarter(starter.id)}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-brown">
                    <Icon size={18} />
                  </div>
                  <div className="mt-4 font-medium text-brand-brown">{starter.label}</div>
                  <div className="mt-2 text-sm leading-6 text-brand-warm">{starter.description}</div>
                </button>
              );
            })}
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
        <div className="mb-4 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Preview checklist</div>
          <div className="mt-3 space-y-2 text-sm text-brand-warm">
            <div>{sectionCount ? `${sectionCount} sections composed` : "Add at least one section"}</div>
            <div>{seoReady ? "SEO title and description are set" : "Complete SEO title and description"}</div>
            <div>{activeRecord.slug ? `Slug ready at /${mode === "post" ? "blog/" : ""}${activeRecord.slug}` : "Add a slug for the final URL"}</div>
          </div>
        </div>
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
