"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ExternalLink,
  FileText,
  Home,
  LayoutTemplate,
  Link as LinkIcon,
  Newspaper,
  Search,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { ContentPreview } from "@/components/admin/content-preview";
import { VisualBlockBuilder } from "@/components/admin/visual-block-builder";
import type { BlogPostRecord, PageRecord } from "@/lib/admin-data";
import { normalizeVisualBlocks } from "@/lib/cms-blocks";

type Props = {
  pages: PageRecord[];
  posts: BlogPostRecord[];
  initialMode?: Mode;
  initialRecordId?: string;
  standalone?: boolean;
};

type Mode = "page" | "post";
type PublishStatus = "draft" | "published" | "scheduled";

type EditorRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyText: string;
  status: PublishStatus;
  seoTitle: string;
  seoDescription: string;
  seoKeywordsText: string;
  canonicalUrl: string;
  coverImageUrl: string;
  authorName: string;
  publishedAt: string;
  previewUrl: string;
  blogType: string;
  category: string;
  tagsText: string;
  scheduledFor: string;
  featuredArticle: boolean;
  featureOnHomepage: boolean;
  highlightInBlog: boolean;
};

const blogTypeOptions = [
  "Article",
  "News",
  "Style Guide",
  "Care Guide",
  "Brand Story",
  "Collection Launch",
  "Customer Story",
  "Announcement",
  "Tutorial",
  "Lookbook Story",
];

const categoryOptions = [
  "Fashion Tips",
  "Handmade Stories",
  "Product Updates",
  "Craftsmanship",
  "Gifting",
  "Editorial",
];

const pageStarters = [
  {
    id: "homepage",
    label: "Homepage layout",
    description: "Pre-label the live homepage sections so each block maps clearly to the storefront.",
    icon: Home,
    body: [
      { type: "heading", content: "Where Every Knot Tells a Story", level: "h2", sectionId: "home-hero", sectionLabel: "Homepage hero", sectionTheme: "paper", sectionLayout: "banner", sectionSpacing: "airy" },
      { type: "paragraph", content: "Use this section for the homepage hero headline, supporting copy, and CTA buttons.", sectionId: "home-hero", sectionLabel: "Homepage hero", sectionTheme: "paper", sectionLayout: "banner", sectionSpacing: "airy" },
      { type: "cta", label: "Shop now", href: "/shop", style: "primary", sectionId: "home-hero", sectionLabel: "Homepage hero", sectionTheme: "paper", sectionLayout: "banner", sectionSpacing: "airy" },
      { type: "cta", label: "Explore collections", href: "/collections", style: "secondary", sectionId: "home-hero", sectionLabel: "Homepage hero", sectionTheme: "paper", sectionLayout: "banner", sectionSpacing: "airy" },
      { type: "heading", content: "Trust strip items", level: "h2", sectionId: "home-intro", sectionLabel: "Welcome intro", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "compact" },
      { type: "paragraph", content: "Use H3 headings below this intro for each slim trust-strip item under the hero.", sectionId: "home-intro", sectionLabel: "Welcome intro", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "compact" },
      { type: "heading", content: "Free Shipping Over 375", level: "h3", sectionId: "home-intro", sectionLabel: "Welcome intro", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "compact" },
      { type: "paragraph", content: "Short support text for trust item one.", sectionId: "home-intro", sectionLabel: "Welcome intro", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "compact" },
      { type: "heading", content: "Artisan Guarantee", level: "h3", sectionId: "home-intro", sectionLabel: "Welcome intro", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "compact" },
      { type: "paragraph", content: "Short support text for trust item two.", sectionId: "home-intro", sectionLabel: "Welcome intro", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "compact" },
      { type: "heading", content: "Our Collections", level: "h2", sectionId: "home-collections", sectionLabel: "Collections", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "paragraph", content: "This text appears above the collection cards grid.", sectionId: "home-collections", sectionLabel: "Collections", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "heading", content: "Best Sellers", level: "h2", sectionId: "home-featured", sectionLabel: "Featured products", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "paragraph", content: "This intro appears above the bestseller product grid.", sectionId: "home-featured", sectionLabel: "Featured products", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "heading", content: "Made by Hand, Made with Heart", level: "h2", sectionId: "home-values", sectionLabel: "Why Sofi Knots", sectionTheme: "paper", sectionLayout: "split", sectionSpacing: "airy" },
      { type: "paragraph", content: "Use this section for the craft story split block.", sectionId: "home-values", sectionLabel: "Why Sofi Knots", sectionTheme: "paper", sectionLayout: "split", sectionSpacing: "airy" },
      { type: "image", url: "", alt: "Craft story image", caption: "Optional craft image", sectionId: "home-values", sectionLabel: "Why Sofi Knots", sectionTheme: "paper", sectionLayout: "split", sectionSpacing: "airy" },
      { type: "cta", label: "Our story", href: "/about", style: "secondary", sectionId: "home-values", sectionLabel: "Why Sofi Knots", sectionTheme: "paper", sectionLayout: "split", sectionSpacing: "airy" },
      { type: "heading", content: "What Our Customers Say", level: "h2", sectionId: "home-testimonials", sectionLabel: "Testimonials", sectionTheme: "ink", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "paragraph", content: "Approved featured reviews appear in this dark testimonial section automatically.", sectionId: "home-testimonials", sectionLabel: "Testimonials", sectionTheme: "ink", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "heading", content: "Join Our Circle", level: "h2", sectionId: "home-newsletter", sectionLabel: "Newsletter", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "paragraph", content: "This text appears above the newsletter signup block.", sectionId: "home-newsletter", sectionLabel: "Newsletter", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "airy" },
      { type: "cta", label: "Subscribe", href: "#", style: "primary", sectionId: "home-newsletter", sectionLabel: "Newsletter", sectionTheme: "paper", sectionLayout: "stacked", sectionSpacing: "airy" },
    ],
  },
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
] as const;

const homepageSectionGuide = [
  { label: "Homepage hero", description: "Controls the hero headline, hero paragraph, and hero CTA buttons." },
  { label: "Welcome intro", description: "Controls the slim trust strip under the hero. Use H3 blocks for each trust item." },
  { label: "Collections", description: "Controls the heading and intro above the homepage collection cards." },
  { label: "Featured products", description: "Controls the heading and intro above the bestseller grid." },
  { label: "Why Sofi Knots", description: "Controls the craft story split section with image, copy, and CTA." },
  { label: "Testimonials", description: "Controls the intro above the dark testimonials block. Reviews still come from the Reviews admin." },
  { label: "Newsletter", description: "Controls the newsletter heading, description, and button label." },
];

const postStarters = [
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
] as const;

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
  blogType: "Article",
  category: "Editorial",
  tagsText: "",
  scheduledFor: "",
  featuredArticle: false,
  featureOnHomepage: false,
  highlightInBlog: false,
};

function emptyDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoString(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function ContentStudio({ pages, posts, initialMode = "page", initialRecordId = "", standalone = false }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [selectedId, setSelectedId] = useState<string>(
    initialRecordId || (standalone ? "" : initialMode === "page" ? pages[0]?.id ?? "" : posts[0]?.id ?? ""),
  );
  const [editor, setEditor] = useState<EditorRecord>(emptyRecord);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [blogTypeFilter, setBlogTypeFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const records = mode === "page" ? pages : posts;

  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      const haystack = [
        record.title,
        "authorName" in record ? record.authorName ?? "" : "",
        "category" in record ? record.category : "",
        "blogType" in record ? record.blogType : "",
        "tags" in record && Array.isArray(record.tags) ? record.tags.join(" ") : "",
      ]
        .join(" ")
        .toLowerCase();
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      if (mode === "page") return matchesQuery;
      const post = record as BlogPostRecord;
      const matchesStatus = statusFilter === "all" || post.adminStatus === statusFilter;
      const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
      const matchesType = blogTypeFilter === "all" || post.blogType === blogTypeFilter;
      return matchesQuery && matchesStatus && matchesCategory && matchesType;
    });
  }, [records, query, mode, statusFilter, categoryFilter, blogTypeFilter]);

  const selected = useMemo<EditorRecord | null>(() => {
    const record = records.find((item) => item.id === selectedId);
    if (!record) return null;
    const base = {
      id: record.id,
      title: record.title,
      slug: record.slug,
      excerpt: record.excerpt ?? "",
      bodyText: JSON.stringify(record.body ?? [], null, 2),
      status: mode === "post" ? (record as BlogPostRecord).adminStatus : (record.status as PublishStatus),
      seoTitle: record.seoTitle ?? "",
      seoDescription: record.seoDescription ?? "",
      seoKeywordsText: record.seoKeywords.join(", "),
      canonicalUrl: record.canonicalUrl ?? "",
      coverImageUrl: "coverImageUrl" in record ? String(record.coverImageUrl ?? "") : "",
      authorName: "authorName" in record ? String(record.authorName ?? "") : "",
      publishedAt: "publishedAt" in record ? emptyDateTimeLocal(typeof record.publishedAt === "string" ? record.publishedAt : "") : "",
      previewUrl: "previewUrl" in record ? String(record.previewUrl ?? "") : "",
      blogType: "blogType" in record ? String(record.blogType ?? "Article") : "Article",
      category: "category" in record ? String(record.category ?? "Editorial") : "Editorial",
      tagsText: "tags" in record && Array.isArray(record.tags) ? record.tags.join(", ") : "",
      scheduledFor: "scheduledFor" in record ? emptyDateTimeLocal(typeof record.scheduledFor === "string" ? record.scheduledFor : "") : "",
      featuredArticle: "featuredArticle" in record ? Boolean(record.featuredArticle) : false,
      featureOnHomepage: "featureOnHomepage" in record ? Boolean(record.featureOnHomepage) : false,
      highlightInBlog: "highlightInBlog" in record ? Boolean(record.highlightInBlog) : false,
    } satisfies EditorRecord;
    return base;
  }, [records, selectedId, mode]);

  const activeRecord = selected ? { ...selected, ...editor } : editor;
  const isHomepagePage = mode === "page" && activeRecord.slug === "home";
  const normalizedBlocks = useMemo(() => normalizeVisualBlocks(activeRecord.bodyText), [activeRecord.bodyText]);
  const sectionCount = new Set(normalizedBlocks.map((block) => block.sectionId)).size;
  const blockCount = normalizedBlocks.length;
  const seoReady = Boolean(activeRecord.seoTitle && activeRecord.seoDescription);

  useEffect(() => {
    if (selected) setEditor(selected);
    if (!selected && !selectedId) setEditor(emptyRecord);
  }, [selected, selectedId]);

  useEffect(() => {
    if (standalone) return;
    const nextRecords = mode === "page" ? pages : posts;
    setSelectedId(nextRecords[0]?.id ?? "");
    setQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setBlogTypeFilter("all");
    setEditor(emptyRecord);
  }, [mode, pages, posts]);

  function createNewRecord() {
    setSelectedId("");
    setEditor(emptyRecord);
  }

  function applyStarter(templateId: string) {
    const starters = mode === "page" ? pageStarters : postStarters;
    const starter = starters.find((entry) => entry.id === templateId);
    if (!starter) return;
    setEditor((current) => ({
      ...current,
      bodyText: JSON.stringify(normalizeVisualBlocks(JSON.stringify(starter.body)), null, 2),
      excerpt: current.excerpt || starter.description,
    }));
    setMessage(`${starter.label} starter applied.`);
  }

  async function saveRecord() {
    return saveRecordWithStatus(activeRecord.status);
  }

  async function saveRecordWithStatus(status: PublishStatus) {
    const endpoint = mode === "page" ? "/api/admin/content/pages" : "/api/admin/content/posts";
    const hasId = Boolean(activeRecord.id);
    let parsedBody: unknown = [];
    try {
      parsedBody = JSON.parse(activeRecord.bodyText || "[]");
    } catch {
      setMessage("Content JSON is invalid. Please fix the body blocks before saving.");
      return;
    }

    const payload = {
      title: activeRecord.title,
      slug: activeRecord.slug,
      excerpt: activeRecord.excerpt,
      body: parsedBody,
      status: mode === "page" ? status : status === "published" ? "published" : "draft",
      adminStatus: status,
      seoTitle: activeRecord.seoTitle,
      seoDescription: activeRecord.seoDescription,
      seoKeywords: activeRecord.seoKeywordsText.split(",").map((value) => value.trim()).filter(Boolean),
      canonicalUrl: activeRecord.canonicalUrl,
      coverImageUrl: activeRecord.coverImageUrl,
      authorName: activeRecord.authorName,
      publishedAt: toIsoString(activeRecord.publishedAt),
      blogType: activeRecord.blogType,
      category: activeRecord.category,
      tags: activeRecord.tagsText.split(",").map((value) => value.trim()).filter(Boolean),
      scheduledFor: toIsoString(activeRecord.scheduledFor),
      featuredArticle: activeRecord.featuredArticle,
      featureOnHomepage: activeRecord.featureOnHomepage,
      highlightInBlog: activeRecord.highlightInBlog,
    };

    const response = await fetch(hasId ? `${endpoint}/${activeRecord.id}` : endpoint, {
      method: hasId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to save content.");
      return;
    }
    setMessage(mode === "page" ? "Page saved." : "Post saved.");
    window.location.reload();
  }

  async function deleteRecord() {
    if (!activeRecord.id) return;
    const endpoint = mode === "page" ? `/api/admin/content/pages/${activeRecord.id}` : `/api/admin/content/posts/${activeRecord.id}`;
    const response = await fetch(endpoint, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Failed to delete content.");
      return;
    }
    window.location.reload();
  }

  const starterCards = mode === "page" ? pageStarters : postStarters;

  return (
    <div className={`grid gap-6 ${standalone ? "2xl:grid-cols-[minmax(0,1fr)_420px]" : "2xl:grid-cols-[320px_minmax(0,1fr)_420px]"}`}>
      {standalone ? null : (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={`rounded-2xl px-4 py-3 text-sm ${mode === "page" ? "bg-brand-brown text-white" : "bg-[#fcfaf5] text-brand-warm"}`} onClick={() => setMode("page")}>
            Pages
          </button>
          <button type="button" className={`rounded-2xl px-4 py-3 text-sm ${mode === "post" ? "bg-brand-brown text-white" : "bg-[#fcfaf5] text-brand-warm"}`} onClick={() => setMode("post")}>
            Blog posts
          </button>
        </div>

        <button type="button" className="brand-btn-outline w-full justify-center px-4 py-3" onClick={createNewRecord}>
          {mode === "page" ? "Create page" : "Add article"}
        </button>

        <div className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] px-4 py-3">
          <Search size={16} className="text-brand-taupe" />
          <input
            className="w-full bg-transparent text-sm text-brand-warm outline-none placeholder:text-brand-taupe"
            placeholder={mode === "page" ? "Search pages" : "Search title, author, category, tag, type"}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {mode === "post" ? (
          <div className="grid gap-3">
            <select className="brand-input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PublishStatus | "all")}>
              <option value="all">All status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
            <select className="brand-input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select className="brand-input" value={blogTypeFilter} onChange={(event) => setBlogTypeFilter(event.target.value)}>
              <option value="all">All blog types</option>
              {blogTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="space-y-3">
          {visibleRecords.map((record) => (
            <button
              key={record.id}
              type="button"
              onClick={() => setSelectedId(record.id)}
              className={`w-full rounded-2xl border p-4 text-left ${selectedId === record.id ? "border-brand-gold bg-white" : "border-brand-sand/40 bg-[#fcfaf5]"}`}
            >
              {(() => {
                const postRecord = mode === "post" ? (record as BlogPostRecord) : null;
                return (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-brand-brown">{record.title}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.16em] text-brand-taupe">{record.slug}</div>
                      </div>
                      {postRecord?.featuredArticle ? <Star size={14} className="mt-1 text-brand-gold" /> : null}
                    </div>
                    {postRecord ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-brand-taupe">
                        <span>{postRecord.blogType}</span>
                        <span>{postRecord.category}</span>
                        <span>{postRecord.adminStatus}</span>
                      </div>
                    ) : null}
                  </>
                );
              })()}
            </button>
          ))}
          {visibleRecords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-sand/50 bg-[#fcfaf5] p-4 text-sm text-brand-warm">
              No content matches the current search or filters.
            </div>
          ) : null}
        </div>
      </div>
      )}

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
          <input className="brand-input" value={activeRecord.slug} onChange={(event) => setEditor((current) => ({ ...current, slug: event.target.value }))} placeholder="URL handle / slug" />
        </div>
        <textarea className="brand-input min-h-24" value={activeRecord.excerpt} onChange={(event) => setEditor((current) => ({ ...current, excerpt: event.target.value }))} placeholder="Short excerpt / summary" />

        {mode === "post" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <select className="brand-input" value={activeRecord.blogType} onChange={(event) => setEditor((current) => ({ ...current, blogType: event.target.value }))}>
                {blogTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select className="brand-input" value={activeRecord.category} onChange={(event) => setEditor((current) => ({ ...current, category: event.target.value }))}>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input className="brand-input" value={activeRecord.authorName} onChange={(event) => setEditor((current) => ({ ...current, authorName: event.target.value }))} placeholder="Author name" />
              <input className="brand-input" value={activeRecord.tagsText} onChange={(event) => setEditor((current) => ({ ...current, tagsText: event.target.value }))} placeholder="Tags separated by comma" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input className="brand-input" value={activeRecord.coverImageUrl} onChange={(event) => setEditor((current) => ({ ...current, coverImageUrl: event.target.value }))} placeholder="Featured image URL" />
              <select className="brand-input" value={activeRecord.status} onChange={(event) => setEditor((current) => ({ ...current, status: event.target.value as PublishStatus }))}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
              <input className="brand-input" type="datetime-local" value={activeRecord.publishedAt} onChange={(event) => setEditor((current) => ({ ...current, publishedAt: event.target.value }))} placeholder="Publish date" />
              <input className="brand-input" type="datetime-local" value={activeRecord.scheduledFor} onChange={(event) => setEditor((current) => ({ ...current, scheduledFor: event.target.value }))} placeholder="Schedule publish" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center justify-between rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] px-4 py-3 text-sm text-brand-warm">
                Featured article
                <input type="checkbox" checked={activeRecord.featuredArticle} onChange={(event) => setEditor((current) => ({ ...current, featuredArticle: event.target.checked }))} />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] px-4 py-3 text-sm text-brand-warm">
                Homepage feature
                <input type="checkbox" checked={activeRecord.featureOnHomepage} onChange={(event) => setEditor((current) => ({ ...current, featureOnHomepage: event.target.checked }))} />
              </label>
              <label className="flex items-center justify-between rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] px-4 py-3 text-sm text-brand-warm">
                Highlight in blog
                <input type="checkbox" checked={activeRecord.highlightInBlog} onChange={(event) => setEditor((current) => ({ ...current, highlightInBlog: event.target.checked }))} />
              </label>
            </div>
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <select className="brand-input" value={activeRecord.status} onChange={(event) => setEditor((current) => ({ ...current, status: event.target.value as PublishStatus }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <input className="brand-input" value={activeRecord.canonicalUrl} onChange={(event) => setEditor((current) => ({ ...current, canonicalUrl: event.target.value }))} placeholder="Canonical URL" />
          </div>
        )}

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

        {isHomepagePage ? (
          <div className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-brand-brown">Homepage section map</p>
                <p className="text-xs text-brand-taupe">
                  The live homepage reads these labeled sections. Keep the section labels below aligned with the blocks you want to control.
                </p>
              </div>
              <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => applyStarter("homepage")}>
                Use homepage layout starter
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {homepageSectionGuide.map((section) => (
                <div key={section.label} className="rounded-2xl border border-brand-sand/40 bg-white px-4 py-3">
                  <div className="text-sm font-medium text-brand-brown">{section.label}</div>
                  <div className="mt-1 text-xs leading-6 text-brand-taupe">{section.description}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brand-brown">Visual section composer</p>
              <p className="text-xs text-brand-taupe">Build the article or page structure visually. Raw JSON is available as an advanced fallback.</p>
            </div>
            <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => setAdvancedMode((current) => !current)}>
              {advancedMode ? "Hide raw JSON" : "Show raw JSON"}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {starterCards.map((starter) => {
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
        <textarea className="brand-input min-h-24" value={activeRecord.seoDescription} onChange={(event) => setEditor((current) => ({ ...current, seoDescription: event.target.value }))} placeholder="Meta description" />

        <div className="flex flex-wrap gap-3">
          <button type="button" className="brand-btn-primary" disabled={isPending} onClick={() => startTransition(async () => void saveRecord())}>
            {isPending ? "Saving..." : mode === "post" ? "Save post" : "Save page"}
          </button>
          {mode === "post" ? (
            <>
              <button type="button" className="brand-btn-outline px-4 py-2" disabled={isPending} onClick={() => startTransition(async () => void saveRecordWithStatus("draft"))}>
                Save as draft
              </button>
              <button type="button" className="brand-btn-outline px-4 py-2" disabled={isPending} onClick={() => startTransition(async () => void saveRecordWithStatus("published"))}>
                Publish now
              </button>
              <button type="button" className="brand-btn-outline px-4 py-2" disabled={isPending} onClick={() => startTransition(async () => void saveRecordWithStatus("scheduled"))}>
                Schedule
              </button>
            </>
          ) : null}
          {activeRecord.id ? (
            <button type="button" className="brand-btn-outline border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white" disabled={isPending} onClick={() => setDeleteOpen(true)}>
              <Trash2 size={15} />
              Delete
            </button>
          ) : null}
        </div>
        {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
      </div>

      <div className={`${standalone ? "2xl:sticky 2xl:top-6 2xl:self-start" : "2xl:sticky 2xl:top-6 2xl:self-start"}`}>
        <div className="mb-4 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Preview checklist</div>
          <div className="mt-3 space-y-2 text-sm text-brand-warm">
            <div>{sectionCount ? `${sectionCount} sections composed` : "Add at least one section"}</div>
            <div>{seoReady ? "SEO title and description are set" : "Complete SEO title and description"}</div>
            <div>{activeRecord.slug ? `Slug ready at /${mode === "post" ? "blog/" : ""}${activeRecord.slug}` : "Add a slug for the final URL"}</div>
            {mode === "post" ? <div>{activeRecord.blogType} in {activeRecord.category}</div> : null}
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

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">{mode === "post" ? "Delete article?" : "Delete page?"}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {mode === "post"
                ? "This article will be removed from the blog and will no longer appear on the website."
                : "This page will be removed from the content library and storefront if published."}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50" onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700" onClick={() => startTransition(async () => void deleteRecord())}>
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
