"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ImageIcon, LayoutTemplate, Plus, Quote, Sparkles, Trash2 } from "lucide-react";

export type VisualContentBlock =
  | { type: "heading"; content: string; level?: "h2" | "h3" }
  | { type: "paragraph"; content: string }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "quote"; quote: string; cite?: string }
  | { type: "cta"; label: string; href: string; style?: "primary" | "secondary" };

const blockTemplates: Record<string, VisualContentBlock> = {
  heading: { type: "heading", content: "New heading", level: "h2" },
  paragraph: { type: "paragraph", content: "Write your story here." },
  image: { type: "image", url: "", alt: "", caption: "" },
  quote: { type: "quote", quote: "Add a quote block.", cite: "" },
  cta: { type: "cta", label: "Shop collection", href: "/shop", style: "primary" },
};

const sectionTemplates: {
  id: string;
  title: string;
  description: string;
  icon: typeof LayoutTemplate;
  blocks: VisualContentBlock[];
}[] = [
  {
    id: "hero-intro",
    title: "Hero intro",
    description: "A strong section opener with heading, supporting copy, and a primary call to action.",
    icon: Sparkles,
    blocks: [
      { type: "heading", content: "Lead with a clear statement", level: "h2" },
      { type: "paragraph", content: "Introduce the section with a concise, benefit-driven paragraph that feels editorial rather than generic." },
      { type: "cta", label: "Explore collection", href: "/shop", style: "primary" },
    ],
  },
  {
    id: "story-section",
    title: "Story section",
    description: "Balanced editorial section with headline, story copy, and supporting image.",
    icon: LayoutTemplate,
    blocks: [
      { type: "heading", content: "Tell the story behind this page", level: "h2" },
      { type: "paragraph", content: "Use this section for founder notes, brand storytelling, campaign context, or educational content." },
      { type: "image", url: "", alt: "Editorial image", caption: "Optional image caption" },
    ],
  },
  {
    id: "testimonial-highlight",
    title: "Testimonial",
    description: "Pull quote section for customer proof, press mentions, or founder voice.",
    icon: Quote,
    blocks: [
      { type: "quote", quote: "Place a compelling customer quote or editorial pull-quote here.", cite: "Customer name or source" },
    ],
  },
  {
    id: "image-spotlight",
    title: "Image spotlight",
    description: "Visual-first section with image, caption, and supporting copy.",
    icon: ImageIcon,
    blocks: [
      { type: "image", url: "", alt: "Spotlight image", caption: "Describe what this image is showing" },
      { type: "paragraph", content: "Add the supporting caption or story that should sit beneath the visual." },
    ],
  },
  {
    id: "cta-banner",
    title: "CTA banner",
    description: "Short conversion section to close a page with a strong next action.",
    icon: Plus,
    blocks: [
      { type: "heading", content: "Invite the next step", level: "h3" },
      { type: "paragraph", content: "Use a short persuasive line here to move readers toward the next action." },
      { type: "cta", label: "Start shopping", href: "/shop", style: "secondary" },
    ],
  },
];

export function parseVisualBlocks(bodyText: string): VisualContentBlock[] {
  try {
    const parsed = JSON.parse(bodyText || "[]");
    return Array.isArray(parsed) ? (parsed as VisualContentBlock[]) : [];
  } catch {
    return [];
  }
}

export function VisualBlockBuilder({ bodyText, onChange }: { bodyText: string; onChange: (next: string) => void }) {
  const [blocks, setBlocks] = useState<VisualContentBlock[]>(() => parseVisualBlocks(bodyText));

  useEffect(() => {
    setBlocks(parseVisualBlocks(bodyText));
  }, [bodyText]);

  function commit(nextBlocks: VisualContentBlock[]) {
    setBlocks(nextBlocks);
    onChange(JSON.stringify(nextBlocks, null, 2));
  }

  function updateBlock(index: number, patch: Partial<VisualContentBlock>) {
    commit(blocks.map((block, blockIndex) => (blockIndex === index ? ({ ...block, ...patch } as VisualContentBlock) : block)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const nextBlocks = [...blocks];
    [nextBlocks[index], nextBlocks[target]] = [nextBlocks[target], nextBlocks[index]];
    commit(nextBlocks);
  }

  function addSectionTemplate(templateId: string) {
    const template = sectionTemplates.find((entry) => entry.id === templateId);
    if (!template) return;
    commit([...blocks, ...structuredClone(template.blocks)]);
  }

  function getBlockLabel(block: VisualContentBlock) {
    if (block.type === "heading") return block.content || "Heading";
    if (block.type === "paragraph") return block.content.slice(0, 70) || "Paragraph";
    if (block.type === "image") return block.caption || block.alt || "Image section";
    if (block.type === "quote") return block.quote.slice(0, 70) || "Quote section";
    return block.label || "CTA section";
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-brand-brown">
          <LayoutTemplate size={16} className="text-brand-gold" />
          Visual section composer
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sectionTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button key={template.id} type="button" className="rounded-2xl border border-brand-sand/40 bg-white p-4 text-left transition hover:border-brand-gold/50 hover:shadow-sm" onClick={() => addSectionTemplate(template.id)}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
                  <Icon size={18} />
                </div>
                <div className="mt-4 font-medium text-brand-brown">{template.title}</div>
                <div className="mt-2 text-sm leading-6 text-brand-warm">{template.description}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(blockTemplates).map((type) => (
            <button key={type} type="button" className="brand-btn-outline px-4 py-2" onClick={() => commit([...blocks, structuredClone(blockTemplates[type])])}>
              <Plus size={15} />
              Add {type} block
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {blocks.length ? (
          blocks.map((block, index) => (
            <div key={`${block.type}-${index}`} className="rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium capitalize text-brand-brown">{block.type} section</div>
                  <div className="text-xs text-brand-taupe">{getBlockLabel(block)}</div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-xl border border-brand-sand/40 p-2 text-brand-warm" onClick={() => moveBlock(index, -1)}>
                    <ChevronUp size={15} />
                  </button>
                  <button type="button" className="rounded-xl border border-brand-sand/40 p-2 text-brand-warm" onClick={() => moveBlock(index, 1)}>
                    <ChevronDown size={15} />
                  </button>
                  <button type="button" className="rounded-xl border border-rose-200 p-2 text-rose-700" onClick={() => commit(blocks.filter((_, blockIndex) => blockIndex !== index))}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {block.type === "heading" ? (
                <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                  <input className="brand-input" value={block.content} onChange={(event) => updateBlock(index, { content: event.target.value })} placeholder="Heading text" />
                  <select className="brand-input" value={block.level ?? "h2"} onChange={(event) => updateBlock(index, { level: event.target.value as "h2" | "h3" })}>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>
                </div>
              ) : null}

              {block.type === "paragraph" ? (
                <textarea className="brand-input min-h-28" value={block.content} onChange={(event) => updateBlock(index, { content: event.target.value })} placeholder="Paragraph text" />
              ) : null}

              {block.type === "image" ? (
                <div className="grid gap-3">
                  <input className="brand-input" value={block.url} onChange={(event) => updateBlock(index, { url: event.target.value })} placeholder="Image URL" />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input className="brand-input" value={block.alt ?? ""} onChange={(event) => updateBlock(index, { alt: event.target.value })} placeholder="Alt text" />
                    <input className="brand-input" value={block.caption ?? ""} onChange={(event) => updateBlock(index, { caption: event.target.value })} placeholder="Caption" />
                  </div>
                </div>
              ) : null}

              {block.type === "quote" ? (
                <div className="grid gap-3">
                  <textarea className="brand-input min-h-24" value={block.quote} onChange={(event) => updateBlock(index, { quote: event.target.value })} placeholder="Quote text" />
                  <input className="brand-input" value={block.cite ?? ""} onChange={(event) => updateBlock(index, { cite: event.target.value })} placeholder="Quote attribution" />
                </div>
              ) : null}

              {block.type === "cta" ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <input className="brand-input" value={block.label} onChange={(event) => updateBlock(index, { label: event.target.value })} placeholder="Button label" />
                  <input className="brand-input" value={block.href} onChange={(event) => updateBlock(index, { href: event.target.value })} placeholder="Link URL" />
                  <select className="brand-input" value={block.style ?? "primary"} onChange={(event) => updateBlock(index, { style: event.target.value as "primary" | "secondary" })}>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-sand/50 bg-[#fcfaf5] p-6 text-sm text-brand-warm">
            No blocks yet. Start by adding a heading, paragraph, image, quote, or CTA block.
          </div>
        )}
      </div>
    </div>
  );
}
