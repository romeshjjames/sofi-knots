import Link from "next/link";
import { groupVisualSections, type VisualContentBlock, type VisualSectionLayout, type VisualSectionSpacing, type VisualSectionTheme } from "@/lib/cms-blocks";

function getSectionThemeClasses(theme: VisualSectionTheme) {
  if (theme === "sand") return "bg-[#f3ebdb] text-brand-brown";
  if (theme === "forest") return "bg-[#254336] text-white";
  if (theme === "ink") return "bg-[#231d19] text-white";
  return "bg-white text-brand-brown";
}

function getSectionSpacingClasses(spacing: VisualSectionSpacing) {
  return spacing === "compact" ? "px-5 py-5" : "px-6 py-6 md:px-8 md:py-8";
}

function getSectionLayoutClasses(layout: VisualSectionLayout, blockCount: number) {
  if (layout === "split" && blockCount > 1) return "grid gap-5 lg:grid-cols-2";
  if (layout === "banner") return "space-y-6 text-center";
  return "space-y-5";
}

function renderBlock(block: VisualContentBlock, index: number, theme: VisualSectionTheme) {
  if (block.type === "heading") {
    const HeadingTag = block.level ?? "h2";
    return <HeadingTag key={`${block.type}-${index}`} className={`font-serif text-2xl ${theme === "ink" ? "text-white" : "text-brand-brown"}`}>{block.content}</HeadingTag>;
  }

  if (block.type === "paragraph") {
    return <p key={`${block.type}-${index}`} className={`text-sm leading-7 ${theme === "ink" ? "text-white/82" : "text-brand-warm"}`}>{block.content}</p>;
  }

  if (block.type === "image") {
    const showCaption = !!block.caption && block.caption.trim().toLowerCase() !== "media library image";

    return (
      <figure key={`${block.type}-${index}`} className="space-y-3">
        {block.url ? (
          <img src={block.url} alt={block.alt || "CMS image"} className="w-full rounded-[24px] object-cover" />
        ) : null}
        {showCaption ? <figcaption className={`text-xs uppercase tracking-[0.16em] ${theme === "ink" ? "text-white/60" : "text-brand-taupe"}`}>{block.caption}</figcaption> : null}
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

function renderSplitSection(section: ReturnType<typeof groupVisualSections>[number]) {
  const imageBlock = section.blocks.find((block) => block.type === "image");
  const contentBlocks = section.blocks.filter((block) => block !== imageBlock);

  if (!imageBlock) {
    return <div className={getSectionLayoutClasses(section.layout, section.blocks.length)}>{section.blocks.map((block, index) => renderBlock(block, index, section.theme))}</div>;
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
      <div className="order-2 lg:order-1">
        {renderBlock(imageBlock, 0, section.theme)}
      </div>
      <div className="order-1 space-y-4 lg:order-2 lg:pt-2">
        {contentBlocks.map((block, index) => renderBlock(block, index + 1, section.theme))}
      </div>
    </div>
  );
}

export function CmsPageRenderer({ bodyText }: { bodyText: string }) {
  const sections = groupVisualSections(bodyText);

  if (!sections.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-brand-sand/50 bg-[#fcfaf5] p-6 text-sm text-brand-warm">
        This page does not have any published sections yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section
          key={section.id}
          className={`rounded-[28px] border border-brand-sand/30 ${getSectionThemeClasses(section.theme)} ${getSectionSpacingClasses(section.spacing)}`}
        >
          {section.layout === "split" ? renderSplitSection(section) : (
            <div className={getSectionLayoutClasses(section.layout, section.blocks.length)}>
              {section.blocks.map((block, index) => renderBlock(block, index, section.theme))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
