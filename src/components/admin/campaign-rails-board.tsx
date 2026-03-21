"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { GripVertical, Layers3, LayoutTemplate, Save, Sparkles } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { HomepageSectionRecord } from "@/lib/admin-data";
import type { Collection, Product } from "@/types/commerce";

type Props = {
  products: Product[];
  collections: Collection[];
  sections: HomepageSectionRecord[];
  initialFeaturedIds: string[];
  initialCollectionIds: string[];
  initialSectionOrder: string[];
  featuredUpdatedAt: string | null;
  collectionUpdatedAt: string | null;
  homepageUpdatedAt: string | null;
};

function orderItems<T extends { id?: string; slug?: string }>(items: T[], orderedIds: string[]) {
  const orderMap = new Map(orderedIds.map((id, index): [string, number] => [id, index]));
  return [...items].sort((left, right) => {
    const leftId = left.id ?? left.slug ?? "";
    const rightId = right.id ?? right.slug ?? "";
    const leftIndex = orderMap.get(leftId);
    const rightIndex = orderMap.get(rightId);
    if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
    if (leftIndex !== undefined) return -1;
    if (rightIndex !== undefined) return 1;
    return leftId.localeCompare(rightId);
  });
}

function orderSections(sections: HomepageSectionRecord[], orderedKeys: string[]) {
  const orderMap = new Map(orderedKeys.map((key, index): [string, number] => [key, index]));
  return [...sections].sort((left, right) => {
    const leftIndex = orderMap.get(left.key);
    const rightIndex = orderMap.get(right.key);
    if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
    if (leftIndex !== undefined) return -1;
    if (rightIndex !== undefined) return 1;
    return left.label.localeCompare(right.label);
  });
}

export function CampaignRailsBoard({
  products,
  collections,
  sections,
  initialFeaturedIds,
  initialCollectionIds,
  initialSectionOrder,
  featuredUpdatedAt,
  collectionUpdatedAt,
  homepageUpdatedAt,
}: Props) {
  const featuredProducts = useMemo(() => products.filter((product) => product.isFeatured), [products]);
  const [featuredRail, setFeaturedRail] = useState(() => orderItems(featuredProducts, initialFeaturedIds));
  const [collectionRail, setCollectionRail] = useState(() => orderItems(collections, initialCollectionIds));
  const [homepageRail, setHomepageRail] = useState(() => orderSections(sections, initialSectionOrder));
  const [dragged, setDragged] = useState<{ rail: "featured" | "collections" | "homepage"; id: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState(
    featuredUpdatedAt || collectionUpdatedAt || homepageUpdatedAt || null,
  );

  useEffect(() => {
    setFeaturedRail(orderItems(featuredProducts, initialFeaturedIds));
  }, [featuredProducts, initialFeaturedIds]);

  useEffect(() => {
    setCollectionRail(orderItems(collections, initialCollectionIds));
  }, [collections, initialCollectionIds]);

  useEffect(() => {
    setHomepageRail(orderSections(sections, initialSectionOrder));
  }, [sections, initialSectionOrder]);

  function moveWithinRail<T extends { id?: string; slug?: string; key?: string }>(
    rail: "featured" | "collections" | "homepage",
    items: T[],
    fromId: string,
    toId: string,
    setter: (next: T[]) => void,
  ) {
    if (fromId === toId) return;
    const next = [...items];
    const fromIndex = next.findIndex((item) => (item.id ?? item.slug ?? item.key) === fromId);
    const toIndex = next.findIndex((item) => (item.id ?? item.slug ?? item.key) === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setter(next);
    setDragged({ rail, id: toId });
  }

  async function saveBoard() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/merchandising/board", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredProductIds: featuredRail.map((item) => item.id),
          collectionIds: collectionRail.map((item) => item.id ?? item.slug),
          homepageSectionOrder: homepageRail.map((item) => item.key),
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save merchandising board.");
        return;
      }
      setSavedAt(body.updatedAt ?? new Date().toISOString());
      setMessage("Campaign board saved.");
      window.location.reload();
    });
  }

  const hasUnsavedChanges =
    featuredRail.map((item) => item.id).join("|") !== orderItems(featuredProducts, initialFeaturedIds).map((item) => item.id).join("|") ||
    collectionRail.map((item) => item.id ?? item.slug).join("|") !== orderItems(collections, initialCollectionIds).map((item) => item.id ?? item.slug).join("|") ||
    homepageRail.map((item) => item.key).join("|") !== orderSections(sections, initialSectionOrder).map((item) => item.key).join("|");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-brand-brown">
            <Layers3 size={16} className="text-brand-gold" />
            Unified campaign rails
          </div>
          <p className="mt-1 text-sm text-brand-warm">Control homepage narrative, featured product order, and collection group order together from one merchandising board.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedAt ? <AdminBadge tone="info">Saved {new Date(savedAt).toLocaleString("en-IN")}</AdminBadge> : null}
          <button type="button" className="brand-btn-primary px-5 py-3" disabled={isPending || !hasUnsavedChanges} onClick={() => void saveBoard()}>
            <Save size={16} />
            {isPending ? "Saving..." : "Save campaign board"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-brand-gold" />
            <h3 className="font-serif text-2xl text-brand-brown">Featured rail</h3>
          </div>
          <div className="space-y-3">
            {featuredRail.map((product, index) => (
              <div
                key={product.id}
                draggable
                onDragStart={() => setDragged({ rail: "featured", id: product.id })}
                onDragEnd={() => setDragged(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragged?.rail === "featured") {
                    moveWithinRail("featured", featuredRail, dragged.id, product.id, setFeaturedRail);
                  }
                  setDragged(null);
                }}
                className={`rounded-[24px] border p-4 ${dragged?.rail === "featured" && dragged.id === product.id ? "border-brand-gold bg-[#fcfaf5]" : "border-brand-sand/40 bg-[#fcfaf5]"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-brand-sand/40 bg-white p-3 text-brand-warm"><GripVertical size={15} /></div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Slot {index + 1}</div>
                    <div className="font-medium text-brand-brown">{product.name}</div>
                    <div className="mt-1 text-sm text-brand-warm">{product.shortDescription}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Layers3 size={16} className="text-brand-gold" />
            <h3 className="font-serif text-2xl text-brand-brown">Collection rail</h3>
          </div>
          <div className="space-y-3">
            {collectionRail.map((collection, index) => {
              const itemId = collection.id ?? collection.slug;
              return (
                <div
                  key={itemId}
                  draggable
                  onDragStart={() => setDragged({ rail: "collections", id: itemId })}
                  onDragEnd={() => setDragged(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (dragged?.rail === "collections") {
                      moveWithinRail("collections", collectionRail, dragged.id, itemId, setCollectionRail);
                    }
                    setDragged(null);
                  }}
                  className={`rounded-[24px] border p-4 ${dragged?.rail === "collections" && dragged.id === itemId ? "border-brand-gold bg-[#fcfaf5]" : "border-brand-sand/40 bg-[#fcfaf5]"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-brand-sand/40 bg-white p-3 text-brand-warm"><GripVertical size={15} /></div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Slot {index + 1}</div>
                      <div className="font-medium text-brand-brown">{collection.title}</div>
                      <div className="mt-1 text-sm text-brand-warm">{collection.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-brand-sand/60 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <LayoutTemplate size={16} className="text-brand-gold" />
            <h3 className="font-serif text-2xl text-brand-brown">Homepage rail</h3>
          </div>
          <div className="space-y-3">
            {homepageRail.map((section, index) => (
              <div
                key={section.key}
                draggable
                onDragStart={() => setDragged({ rail: "homepage", id: section.key })}
                onDragEnd={() => setDragged(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragged?.rail === "homepage") {
                    moveWithinRail("homepage", homepageRail, dragged.id, section.key, setHomepageRail);
                  }
                  setDragged(null);
                }}
                className={`rounded-[24px] border p-4 ${dragged?.rail === "homepage" && dragged.id === section.key ? "border-brand-gold bg-[#fcfaf5]" : "border-brand-sand/40 bg-[#fcfaf5]"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-brand-sand/40 bg-white p-3 text-brand-warm"><GripVertical size={15} /></div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.16em] text-brand-taupe">Slot {index + 1}</div>
                    <div className="font-medium text-brand-brown">{section.label}</div>
                    <div className="mt-1 text-sm text-brand-warm">{section.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
