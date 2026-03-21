"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(blockTemplates).map((type) => (
          <button key={type} type="button" className="brand-btn-outline px-4 py-2" onClick={() => commit([...blocks, structuredClone(blockTemplates[type])])}>
            <Plus size={15} />
            Add {type}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {blocks.length ? (
          blocks.map((block, index) => (
            <div key={`${block.type}-${index}`} className="rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium capitalize text-brand-brown">{block.type} block</div>
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
