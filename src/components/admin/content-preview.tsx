"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, Monitor, Search, Smartphone, Tablet } from "lucide-react";
import { groupVisualSections, type VisualContentBlock, type VisualSectionLayout, type VisualSectionSpacing, type VisualSectionTheme } from "@/lib/cms-blocks";

type Props = {
  mode: "page" | "post";
  title: string;
  slug: string;
  excerpt: string;
  bodyText: string;
  coverImageUrl?: string;
  authorName?: string;
  publishedAt?: string;
  seoTitle: string;
  seoDescription: string;
};

function renderBlock(block: VisualContentBlock, index: number, theme: VisualSectionTheme) {
  if (block.type === "heading") {
    const HeadingTag = block.level ?? "h2";
    return <HeadingTag key={`${block.type}-${index}`} className={`font-serif text-2xl ${theme === "ink" ? "text-white" : "text-brand-brown"}`}>{block.content}</HeadingTag>;
  }

  if (block.type === "paragraph") {
    return <p key={`${block.type}-${index}`} className={`text-sm leading-7 ${theme === "ink" ? "text-white/82" : "text-brand-warm"}`}>{block.content}</p>;
  }

  if (block.type === "image") {
    return (
      <figure key={`${block.type}-${index}`} className="space-y-3">
        {block.url ? (
          <img src={block.url} alt={block.alt || "Preview image"} className="w-full rounded-[24px] object-cover" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center rounded-[24px] border border-dashed border-brand-sand/50 bg-brand-cream text-sm text-brand-taupe">
            Add an image URL to preview this block
          </div>
        )}
        {block.caption ? <figcaption className={`text-xs uppercase tracking-[0.16em] ${theme === "ink" ? "text-white/60" : "text-brand-taupe"}`}>{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote key={`${block.type}-${index}`} className={`rounded-[24px] px-5 py-4 ${theme === "ink" ? "border border-white/10 bg-white/5" : "border border-brand-sand/50 bg-[#fcfaf5]"}`}>
        <p className={`font-serif text-xl leading-8 ${theme === "ink" ? "text-white" : "text-brand-brown"}`}>"{block.quote}"</p>
        {block.cite ? <footer className={`mt-3 text-xs uppercase tracking-[0.16em] ${theme === "ink" ? "text-white/60" : "text-brand-taupe"}`}>{block.cite}</footer> : null}
      </blockquote>
    );
  }

  return (
    <Link
      key={`${block.type}-${index}`}
      href={block.href || "#"}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${
        block.style === "secondary"
          ? theme === "ink"
            ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border border-brand-sand/60 bg-white text-brand-brown hover:bg-brand-cream"
          : theme === "forest"
            ? "bg-brand-gold text-brand-brown hover:bg-[#f0c781]"
            : "bg-brand-brown text-white hover:bg-brand-warm"
      }`}
    >
      {block.label || "Call to action"}
    </Link>
  );
}

function getSectionThemeClasses(theme: VisualSectionTheme) {
  if (theme === "sand") return "bg-[#f3ebdb] text-brand-brown";
  if (theme === "forest") return "bg-[#254336] text-white";
  if (theme === "ink") return "bg-[#231d19] text-white";
  return "bg-white text-brand-brown";
}

function getSectionSpacingClasses(spacing: VisualSectionSpacing) {
  return spacing === "compact" ? "px-5 py-5" : "px-6 py-8 md:px-8 md:py-10";
}

function getSectionLayoutClasses(layout: VisualSectionLayout, blockCount: number) {
  if (layout === "split" && blockCount > 1) return "grid gap-5 lg:grid-cols-2";
  if (layout === "banner") return "space-y-6 text-center";
  return "space-y-5";
}

export function ContentPreview({ mode, title, slug, excerpt, bodyText, coverImageUrl, authorName, publishedAt, seoTitle, seoDescription }: Props) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [previewMode, setPreviewMode] = useState<"page" | "search">("page");
  let isInvalidJson = false;
  try {
    JSON.parse(bodyText || "[]");
  } catch {
    isInvalidJson = true;
  }
  const sections = isInvalidJson ? [] : groupVisualSections(bodyText);
  const viewportClasses = {
    mobile: "max-w-[390px]",
    tablet: "max-w-[720px]",
    desktop: "max-w-none",
  } as const;

  const previewTitle = title || (mode === "page" ? "Untitled page" : "Untitled post");
  const previewSlug = slug ? `/${mode === "page" ? "" : "blog/"}${slug}`.replace("//", "/") : mode === "page" ? "/new-page" : "/blog/new-post";

  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-brand-sand/60 bg-white p-5 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-brand-gold">
          <Eye size={14} />
          Live preview
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setPreviewMode("page")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${previewMode === "page" ? "bg-brand-brown text-white" : "border border-brand-sand/50 bg-[#fcfaf5] text-brand-warm"}`}>
            <Eye size={14} />
            Page
          </button>
          <button type="button" onClick={() => setPreviewMode("search")} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${previewMode === "search" ? "bg-brand-brown text-white" : "border border-brand-sand/50 bg-[#fcfaf5] text-brand-warm"}`}>
            <Search size={14} />
            Search snippet
          </button>
        </div>
        <div className="mt-4 rounded-[24px] border border-brand-sand/50 bg-[#fcfaf5] p-4">
          <div className="rounded-[20px] border border-brand-sand/50 bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">URL preview</div>
            <div className="mt-2 text-sm font-medium text-brand-brown">{previewSlug}</div>
            <div className="mt-3 text-lg font-medium text-brand-brown">{seoTitle || previewTitle}</div>
            <div className="mt-1 text-sm leading-6 text-brand-warm">{seoDescription || excerpt || "Add a summary to improve snippets and social previews."}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-brand-sand/60 bg-white p-5 shadow-[0_18px_50px_rgba(65,42,17,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-sand/40 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">{mode === "page" ? "Landing page" : "Editorial post"}</p>
            <h3 className="mt-3 font-serif text-3xl text-brand-brown">{previewTitle}</h3>
            {excerpt ? <p className="mt-3 text-sm leading-7 text-brand-warm">{excerpt}</p> : null}
            {mode === "post" ? (
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-brand-taupe">
                {authorName ? <span>{authorName}</span> : null}
                {publishedAt ? <span>{new Date(publishedAt).toLocaleDateString("en-IN")}</span> : null}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "mobile", label: "Mobile", icon: Smartphone },
              { key: "tablet", label: "Tablet", icon: Tablet },
              { key: "desktop", label: "Desktop", icon: Monitor },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setViewport(option.key as typeof viewport)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition ${
                  viewport === option.key ? "bg-brand-brown text-white" : "border border-brand-sand/50 bg-[#fcfaf5] text-brand-warm"
                }`}
              >
                <option.icon size={14} />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[28px] bg-[#f7f2e8] p-4">
          <div className={`mx-auto overflow-hidden rounded-[28px] border border-brand-sand/50 bg-white shadow-[0_18px_40px_rgba(65,42,17,0.08)] ${viewportClasses[viewport]}`}>
            <div className="flex items-center gap-2 border-b border-brand-sand/40 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <span className="ml-2 text-xs uppercase tracking-[0.16em] text-brand-taupe">{viewport} preview</span>
            </div>

            <div className="p-5">
              {previewMode === "search" ? (
                <div className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-5">
                  <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Google result simulation</div>
                  <div className="mt-4 text-sm text-emerald-700">{previewSlug}</div>
                  <div className="mt-1 text-[22px] font-medium leading-8 text-[#1a0dab]">{seoTitle || previewTitle}</div>
                  <p className="mt-2 text-sm leading-6 text-[#4d5156]">{seoDescription || excerpt || "Add a concise, intent-matching description to improve click-through rate."}</p>
                </div>
              ) : (
                <>
                  {coverImageUrl ? <img src={coverImageUrl} alt={previewTitle} className="aspect-[16/9] w-full rounded-[24px] object-cover" /> : null}

                  <div className="mt-5 space-y-5">
                    {isInvalidJson ? (
                      <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p>The raw JSON is invalid right now, so the live preview cannot render until the content structure is fixed.</p>
                      </div>
                    ) : sections.length ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {sections.map((section, index) => (
                            <span key={section.id} className="rounded-full border border-brand-sand/40 bg-[#fcfaf5] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-brand-taupe">
                              {index + 1}. {section.label}
                            </span>
                          ))}
                        </div>
                        {sections.map((section) => (
                          <section
                            key={section.id}
                            className={`rounded-[28px] border border-brand-sand/30 ${getSectionThemeClasses(section.theme)} ${getSectionSpacingClasses(section.spacing)}`}
                          >
                            <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
                              <span className={section.theme === "ink" || section.theme === "forest" ? "text-white/60" : "text-brand-taupe"}>{section.label}</span>
                              <span className={section.theme === "ink" || section.theme === "forest" ? "text-white/45" : "text-brand-taupe/70"}>{section.layout}</span>
                            </div>
                            <div className={getSectionLayoutClasses(section.layout, section.blocks.length)}>
                              {section.blocks.map((block, index) => renderBlock(block, index, section.theme))}
                            </div>
                          </section>
                        ))}
                      </>
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-brand-sand/50 bg-[#fcfaf5] p-5 text-sm text-brand-warm">
                        Add some content sections to preview the finished page layout here.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
