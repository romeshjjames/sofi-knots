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

export type VisualSection = {
  id: string;
  label: string;
  theme: VisualSectionTheme;
  layout: VisualSectionLayout;
  spacing: VisualSectionSpacing;
  blocks: VisualContentBlock[];
};

export const defaultSectionMeta = {
  theme: "paper",
  layout: "stacked",
  spacing: "airy",
} satisfies Pick<VisualSection, "theme" | "layout" | "spacing">;

export function createSectionId() {
  return `section_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseVisualBlocks(bodyText: string): VisualContentBlock[] {
  try {
    const parsed = JSON.parse(bodyText || "[]");
    return Array.isArray(parsed) ? (parsed as VisualContentBlock[]) : [];
  } catch {
    return [];
  }
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

export function buildSectionBlock(block: VisualContentBlock, section: Omit<VisualSection, "blocks">): VisualContentBlock {
  return {
    ...block,
    sectionId: section.id,
    sectionLabel: section.label,
    sectionTheme: section.theme,
    sectionLayout: section.layout,
    sectionSpacing: section.spacing,
  };
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
