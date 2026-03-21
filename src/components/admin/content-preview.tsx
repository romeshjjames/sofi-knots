"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, Monitor, Smartphone, Tablet } from "lucide-react";
import { parseVisualBlocks, type VisualContentBlock } from "@/components/admin/visual-block-builder";

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

function renderBlock(block: VisualContentBlock, index: number) {
  if (block.type === "heading") {
    const HeadingTag = block.level ?? "h2";
    return <HeadingTag key={`${block.type}-${index}`} className="font-serif text-2xl text-brand-brown">{block.content}</HeadingTag>;
  }

  if (block.type === "paragraph") {
    return <p key={`${block.type}-${index}`} className="text-sm leading-7 text-brand-warm">{block.content}</p>;
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
        {block.caption ? <figcaption className="text-xs uppercase tracking-[0.16em] text-brand-taupe">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote key={`${block.type}-${index}`} className="rounded-[24px] border border-brand-sand/50 bg-[#fcfaf5] px-5 py-4">
        <p className="font-serif text-xl leading-8 text-brand-brown">"{block.quote}"</p>
        {block.cite ? <footer className="mt-3 text-xs uppercase tracking-[0.16em] text-brand-taupe">{block.cite}</footer> : null}
      </blockquote>
    );
  }

  return (
    <Link
      key={`${block.type}-${index}`}
      href={block.href || "#"}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition ${
        block.style === "secondary" ? "border border-brand-sand/60 bg-white text-brand-brown hover:bg-brand-cream" : "bg-brand-brown text-white hover:bg-brand-warm"
      }`}
    >
      {block.label || "Call to action"}
    </Link>
  );
}

export function ContentPreview({ mode, title, slug, excerpt, bodyText, coverImageUrl, authorName, publishedAt, seoTitle, seoDescription }: Props) {
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");
  let isInvalidJson = false;
  try {
    JSON.parse(bodyText || "[]");
  } catch {
    isInvalidJson = true;
  }
  const blocks: VisualContentBlock[] = isInvalidJson ? [] : parseVisualBlocks(bodyText);
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
              {coverImageUrl ? <img src={coverImageUrl} alt={previewTitle} className="aspect-[16/9] w-full rounded-[24px] object-cover" /> : null}

              <div className="mt-5 space-y-5">
                {isInvalidJson ? (
                  <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <p>The raw JSON is invalid right now, so the live preview cannot render until the content structure is fixed.</p>
                  </div>
                ) : blocks.length ? (
                  blocks.map((block, index) => renderBlock(block, index))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-brand-sand/50 bg-[#fcfaf5] p-5 text-sm text-brand-warm">
                    Add some content blocks to preview the finished page layout here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
