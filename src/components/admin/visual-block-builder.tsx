"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, ImageIcon, LayoutTemplate, Palette, Plus, Quote, Sparkles, Trash2 } from "lucide-react";

export type VisualSectionTheme = "paper" | "sand" | "forest" | "ink";
export type VisualSectionLayout = "stacked" | "split" | "banner";
export type VisualSectionSpacing = "compact" | "airy";

type VisualSectionMeta = {
  sectionId?: string;
  sectionLabel?: string;
  sectionTheme?: VisualSectionTheme;
  sectionLayout?: VisualSectionLayout;
  sectionSpacing?: VisualSectionSpacing;
};

export type VisualContentBlock =
  | ({ type: "heading"; content: string; level?: "h2" | "h3" } & VisualSectionMeta)
  | ({ type: "paragraph"; content: string } & VisualSectionMeta)
  | ({ type: "image"; url: string; alt?: string; caption?: string } & VisualSectionMeta)
  | ({ type: "quote"; quote: string; cite?: string } & VisualSectionMeta)
  | ({ type: "cta"; label: string; href: string; style?: "primary" | "secondary" } & VisualSectionMeta);

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
  theme: VisualSectionTheme;
  layout: VisualSectionLayout;
  spacing: VisualSectionSpacing;
  blocks: VisualContentBlock[];
}[] = [
  {
    id: "hero-intro",
    title: "Hero intro",
    description: "A strong section opener with heading, supporting copy, and a primary call to action.",
    icon: Sparkles,
    theme: "paper",
    layout: "banner",
    spacing: "airy",
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
    theme: "sand",
    layout: "split",
    spacing: "airy",
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
    theme: "ink",
    layout: "stacked",
    spacing: "compact",
    blocks: [
      { type: "quote", quote: "Place a compelling customer quote or editorial pull-quote here.", cite: "Customer name or source" },
    ],
  },
  {
    id: "image-spotlight",
    title: "Image spotlight",
    description: "Visual-first section with image, caption, and supporting copy.",
    icon: ImageIcon,
    theme: "paper",
    layout: "split",
    spacing: "compact",
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
    theme: "forest",
    layout: "banner",
    spacing: "compact",
    blocks: [
      { type: "heading", content: "Invite the next step", level: "h3" },
      { type: "paragraph", content: "Use a short persuasive line here to move readers toward the next action." },
      { type: "cta", label: "Start shopping", href: "/shop", style: "secondary" },
    ],
  },
];

type VisualSection = {
  id: string;
  label: string;
  theme: VisualSectionTheme;
  layout: VisualSectionLayout;
  spacing: VisualSectionSpacing;
  blocks: VisualContentBlock[];
};

const defaultSectionMeta = {
  theme: "paper",
  layout: "stacked",
  spacing: "airy",
} satisfies Pick<VisualSection, "theme" | "layout" | "spacing">;

function createSectionId() {
  return `section_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildSectionBlock(block: VisualContentBlock, section: Omit<VisualSection, "blocks">): VisualContentBlock {
  return {
    ...block,
    sectionId: section.id,
    sectionLabel: section.label,
    sectionTheme: section.theme,
    sectionLayout: section.layout,
    sectionSpacing: section.spacing,
  };
}

export function normalizeVisualBlocks(bodyText: string): VisualContentBlock[] {
  const parsed = parseVisualBlocks(bodyText);
  let fallbackIndex = 1;

  return parsed.map((block) => {
    const sectionId = block.sectionId ?? `legacy_section_${fallbackIndex}`;
    const normalized = {
      ...block,
      sectionId,
      sectionLabel: block.sectionLabel ?? `Section ${fallbackIndex}`,
      sectionTheme: block.sectionTheme ?? defaultSectionMeta.theme,
      sectionLayout: block.sectionLayout ?? defaultSectionMeta.layout,
      sectionSpacing: block.sectionSpacing ?? defaultSectionMeta.spacing,
    } satisfies VisualContentBlock;

    if (!block.sectionId) fallbackIndex += 1;
    return normalized;
  });
}

export function groupVisualSections(bodyText: string): VisualSection[] {
  const normalized = normalizeVisualBlocks(bodyText);
  const sections: VisualSection[] = [];

  normalized.forEach((block) => {
    const sectionId = block.sectionId ?? createSectionId();
    const existing = sections.find((section) => section.id === sectionId);
    if (existing) {
      existing.blocks.push(block);
      return;
    }

    sections.push({
      id: sectionId,
      label: block.sectionLabel ?? "Untitled section",
      theme: block.sectionTheme ?? defaultSectionMeta.theme,
      layout: block.sectionLayout ?? defaultSectionMeta.layout,
      spacing: block.sectionSpacing ?? defaultSectionMeta.spacing,
      blocks: [block],
    });
  });

  return sections;
}

export function parseVisualBlocks(bodyText: string): VisualContentBlock[] {
  try {
    const parsed = JSON.parse(bodyText || "[]");
    return Array.isArray(parsed) ? (parsed as VisualContentBlock[]) : [];
  } catch {
    return [];
  }
}

export function VisualBlockBuilder({ bodyText, onChange }: { bodyText: string; onChange: (next: string) => void }) {
  const [blocks, setBlocks] = useState<VisualContentBlock[]>(() => normalizeVisualBlocks(bodyText));

  useEffect(() => {
    setBlocks(normalizeVisualBlocks(bodyText));
  }, [bodyText]);

  const sections = useMemo(() => {
    const grouped = new Map<string, VisualSection>();
    blocks.forEach((block) => {
      const sectionId = block.sectionId ?? createSectionId();
      if (!grouped.has(sectionId)) {
        grouped.set(sectionId, {
          id: sectionId,
          label: block.sectionLabel ?? "Untitled section",
          theme: block.sectionTheme ?? defaultSectionMeta.theme,
          layout: block.sectionLayout ?? defaultSectionMeta.layout,
          spacing: block.sectionSpacing ?? defaultSectionMeta.spacing,
          blocks: [],
        });
      }
      grouped.get(sectionId)?.blocks.push(block);
    });
    return Array.from(grouped.values());
  }, [blocks]);

  function commit(nextBlocks: VisualContentBlock[]) {
    setBlocks(nextBlocks);
    onChange(JSON.stringify(nextBlocks, null, 2));
  }

  function addSectionTemplate(templateId: string) {
    const template = sectionTemplates.find((entry) => entry.id === templateId);
    if (!template) return;
    const section = {
      id: createSectionId(),
      label: template.title,
      theme: template.theme,
      layout: template.layout,
      spacing: template.spacing,
    };
    commit([...blocks, ...structuredClone(template.blocks).map((block) => buildSectionBlock(block, section))]);
  }

  function addEmptySection() {
    const section = {
      id: createSectionId(),
      label: `Section ${sections.length + 1}`,
      theme: defaultSectionMeta.theme,
      layout: defaultSectionMeta.layout,
      spacing: defaultSectionMeta.spacing,
    };
    commit([
      ...blocks,
      buildSectionBlock({ type: "heading", content: "New section heading", level: "h2" }, section),
      buildSectionBlock({ type: "paragraph", content: "Add supporting copy for this section." }, section),
    ]);
  }

  function addBlockToSection(sectionId: string, type: keyof typeof blockTemplates) {
    const section = sections.find((entry) => entry.id === sectionId);
    if (!section) return;
    commit([
      ...blocks,
      buildSectionBlock(structuredClone(blockTemplates[type]), {
        id: section.id,
        label: section.label,
        theme: section.theme,
        layout: section.layout,
        spacing: section.spacing,
      }),
    ]);
  }

  function getBlockLabel(block: VisualContentBlock) {
    if (block.type === "heading") return block.content || "Heading";
    if (block.type === "paragraph") return block.content.slice(0, 70) || "Paragraph";
    if (block.type === "image") return block.caption || block.alt || "Image section";
    if (block.type === "quote") return block.quote.slice(0, 70) || "Quote section";
    return block.label || "CTA section";
  }

  function updateSection(sectionId: string, patch: Partial<Omit<VisualSection, "blocks">>) {
    commit(
      blocks.map((block) =>
        block.sectionId === sectionId
          ? {
              ...block,
              sectionLabel: patch.label ?? block.sectionLabel,
              sectionTheme: patch.theme ?? block.sectionTheme,
              sectionLayout: patch.layout ?? block.sectionLayout,
              sectionSpacing: patch.spacing ?? block.sectionSpacing,
            }
          : block,
      ),
    );
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const index = sections.findIndex((section) => section.id === sectionId);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= sections.length) return;
    const nextSections = [...sections];
    [nextSections[index], nextSections[target]] = [nextSections[target], nextSections[index]];
    commit(nextSections.flatMap((section) => section.blocks));
  }

  function duplicateSection(sectionId: string) {
    const section = sections.find((entry) => entry.id === sectionId);
    if (!section) return;
    const duplicatedMeta = {
      id: createSectionId(),
      label: `${section.label} copy`,
      theme: section.theme,
      layout: section.layout,
      spacing: section.spacing,
    };
    commit([...blocks, ...structuredClone(section.blocks).map((block) => buildSectionBlock(block, duplicatedMeta))]);
  }

  function removeSection(sectionId: string) {
    commit(blocks.filter((block) => block.sectionId !== sectionId));
  }

  function updateSectionBlocks(sectionId: string, updater: (current: VisualContentBlock[]) => VisualContentBlock[]) {
    const nextSections = sections.map((section) => {
      if (section.id !== sectionId) return section;
      return { ...section, blocks: updater(section.blocks) };
    });
    commit(nextSections.flatMap((section) => section.blocks));
  }

  function updateBlockInSection(sectionId: string, index: number, patch: Partial<VisualContentBlock>) {
    updateSectionBlocks(sectionId, (current) =>
      current.map((block, blockIndex) => (blockIndex === index ? ({ ...block, ...patch } as VisualContentBlock) : block)),
    );
  }

  function moveBlockInSection(sectionId: string, index: number, direction: -1 | 1) {
    updateSectionBlocks(sectionId, (current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeBlockFromSection(sectionId: string, index: number) {
    updateSectionBlocks(sectionId, (current) => current.filter((_, blockIndex) => blockIndex !== index));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-brown">
            <LayoutTemplate size={16} className="text-brand-gold" />
            Visual section composer
          </div>
          <button type="button" className="brand-btn-outline px-4 py-2" onClick={addEmptySection}>
            <Plus size={15} />
            New section
          </button>
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
        <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brand-taupe">
          <Palette size={14} />
          Compose pages by section, then fine-tune blocks inside each section.
        </div>
      </div>

      <div className="space-y-3">
        {sections.length ? (
          sections.map((section, sectionIndex) => (
            <div key={section.id} className="rounded-[28px] border border-brand-sand/40 bg-white p-4 shadow-[0_18px_40px_rgba(65,42,17,0.05)]">
              <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px_160px]">
                  <input className="brand-input" value={section.label} onChange={(event) => updateSection(section.id, { label: event.target.value })} placeholder="Section label" />
                  <select className="brand-input" value={section.theme} onChange={(event) => updateSection(section.id, { theme: event.target.value as VisualSectionTheme })}>
                    <option value="paper">Paper theme</option>
                    <option value="sand">Sand theme</option>
                    <option value="forest">Forest theme</option>
                    <option value="ink">Ink theme</option>
                  </select>
                  <select className="brand-input" value={section.layout} onChange={(event) => updateSection(section.id, { layout: event.target.value as VisualSectionLayout })}>
                    <option value="stacked">Stacked layout</option>
                    <option value="split">Split layout</option>
                    <option value="banner">Banner layout</option>
                  </select>
                  <select className="brand-input" value={section.spacing} onChange={(event) => updateSection(section.id, { spacing: event.target.value as VisualSectionSpacing })}>
                    <option value="compact">Compact spacing</option>
                    <option value="airy">Airy spacing</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-xl border border-brand-sand/40 p-2 text-brand-warm" onClick={() => moveSection(section.id, -1)}>
                    <ChevronUp size={15} />
                  </button>
                  <button type="button" className="rounded-xl border border-brand-sand/40 p-2 text-brand-warm" onClick={() => moveSection(section.id, 1)}>
                    <ChevronDown size={15} />
                  </button>
                  <button type="button" className="rounded-xl border border-brand-sand/40 p-2 text-brand-warm" onClick={() => duplicateSection(section.id)}>
                    <Copy size={15} />
                  </button>
                  <button type="button" className="rounded-xl border border-rose-200 p-2 text-rose-700" onClick={() => removeSection(section.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between rounded-[24px] bg-[#fcfaf5] px-4 py-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Section {sectionIndex + 1}</div>
                  <div className="text-sm font-medium text-brand-brown">{section.blocks.length} block{section.blocks.length === 1 ? "" : "s"}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(blockTemplates).map((type) => (
                    <button key={type} type="button" className="brand-btn-outline px-3 py-2 text-xs" onClick={() => addBlockToSection(section.id, type as keyof typeof blockTemplates)}>
                      <Plus size={14} />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {section.blocks.map((block, index) => (
                  <div key={`${section.id}-${block.type}-${index}`} className="rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium capitalize text-brand-brown">{block.type} block</div>
                        <div className="text-xs text-brand-taupe">{getBlockLabel(block)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="rounded-xl border border-brand-sand/40 p-2 text-brand-warm" onClick={() => moveBlockInSection(section.id, index, -1)}>
                          <ChevronUp size={15} />
                        </button>
                        <button type="button" className="rounded-xl border border-brand-sand/40 p-2 text-brand-warm" onClick={() => moveBlockInSection(section.id, index, 1)}>
                          <ChevronDown size={15} />
                        </button>
                        <button type="button" className="rounded-xl border border-rose-200 p-2 text-rose-700" onClick={() => removeBlockFromSection(section.id, index)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {block.type === "heading" ? (
                      <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                        <input className="brand-input" value={block.content} onChange={(event) => updateBlockInSection(section.id, index, { content: event.target.value })} placeholder="Heading text" />
                        <select className="brand-input" value={block.level ?? "h2"} onChange={(event) => updateBlockInSection(section.id, index, { level: event.target.value as "h2" | "h3" })}>
                          <option value="h2">H2</option>
                          <option value="h3">H3</option>
                        </select>
                      </div>
                    ) : null}

                    {block.type === "paragraph" ? (
                      <textarea className="brand-input min-h-28" value={block.content} onChange={(event) => updateBlockInSection(section.id, index, { content: event.target.value })} placeholder="Paragraph text" />
                    ) : null}

                    {block.type === "image" ? (
                      <div className="grid gap-3">
                        <input className="brand-input" value={block.url} onChange={(event) => updateBlockInSection(section.id, index, { url: event.target.value })} placeholder="Image URL" />
                        <div className="grid gap-3 md:grid-cols-2">
                          <input className="brand-input" value={block.alt ?? ""} onChange={(event) => updateBlockInSection(section.id, index, { alt: event.target.value })} placeholder="Alt text" />
                          <input className="brand-input" value={block.caption ?? ""} onChange={(event) => updateBlockInSection(section.id, index, { caption: event.target.value })} placeholder="Caption" />
                        </div>
                      </div>
                    ) : null}

                    {block.type === "quote" ? (
                      <div className="grid gap-3">
                        <textarea className="brand-input min-h-24" value={block.quote} onChange={(event) => updateBlockInSection(section.id, index, { quote: event.target.value })} placeholder="Quote text" />
                        <input className="brand-input" value={block.cite ?? ""} onChange={(event) => updateBlockInSection(section.id, index, { cite: event.target.value })} placeholder="Quote attribution" />
                      </div>
                    ) : null}

                    {block.type === "cta" ? (
                      <div className="grid gap-3 md:grid-cols-3">
                        <input className="brand-input" value={block.label} onChange={(event) => updateBlockInSection(section.id, index, { label: event.target.value })} placeholder="Button label" />
                        <input className="brand-input" value={block.href} onChange={(event) => updateBlockInSection(section.id, index, { href: event.target.value })} placeholder="Link URL" />
                        <select className="brand-input" value={block.style ?? "primary"} onChange={(event) => updateBlockInSection(section.id, index, { style: event.target.value as "primary" | "secondary" })}>
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                        </select>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-sand/50 bg-[#fcfaf5] p-6 text-sm text-brand-warm">
            No sections yet. Start with a section template or create a blank section to begin composing.
          </div>
        )}
      </div>
    </div>
  );
}
