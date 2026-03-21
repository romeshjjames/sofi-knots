"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { GripVertical, LayoutTemplate } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";
import type { HomepageSectionKey, HomepageSectionRecord } from "@/lib/admin-data";

type Props = {
  sections: HomepageSectionRecord[];
  initialSectionOrder: HomepageSectionKey[];
  updatedAt: string | null;
};

function orderSections(sections: HomepageSectionRecord[], orderedKeys: HomepageSectionKey[]) {
  const orderMap = new Map<HomepageSectionKey, number>(orderedKeys.map((key, index): [HomepageSectionKey, number] => [key, index]));
  return [...sections].sort((left, right) => {
    const leftIndex = orderMap.get(left.key);
    const rightIndex = orderMap.get(right.key);

    if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
    if (leftIndex !== undefined) return -1;
    if (rightIndex !== undefined) return 1;
    return 0;
  });
}

export function HomepageSectionsManager({ sections, initialSectionOrder, updatedAt }: Props) {
  const [orderedSections, setOrderedSections] = useState(() => orderSections(sections, initialSectionOrder));
  const [draggedKey, setDraggedKey] = useState<HomepageSectionKey | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(updatedAt);
  const [isPending, startTransition] = useTransition();

  const initialOrder = useMemo(() => orderSections(sections, initialSectionOrder), [sections, initialSectionOrder]);

  useEffect(() => {
    setOrderedSections(initialOrder);
    setSavedAt(updatedAt);
  }, [initialOrder, updatedAt]);

  const hasUnsavedChanges = orderedSections.map((section) => section.key).join("|") !== initialOrder.map((section) => section.key).join("|");

  function moveSection(fromKey: HomepageSectionKey, toKey: HomepageSectionKey) {
    if (fromKey === toKey) return;
    setOrderedSections((current) => {
      const next = [...current];
      const fromIndex = next.findIndex((section) => section.key === fromKey);
      const toIndex = next.findIndex((section) => section.key === toKey);
      if (fromIndex === -1 || toIndex === -1) return current;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  async function saveOrder() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/merchandising/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionOrder: orderedSections.map((section) => section.key) }),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save homepage section order.");
        return;
      }

      setMessage("Homepage section order saved.");
      setSavedAt(body.merchandising?.updatedAt ?? new Date().toISOString());
      window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-brand-brown">
            <LayoutTemplate size={16} className="text-brand-gold" />
            Homepage section order
          </div>
          <p className="mt-1 text-sm text-brand-warm">Reorder the homepage narrative so campaigns and conversion priorities can change without code edits.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          {savedAt ? <AdminBadge tone="info">Saved {new Date(savedAt).toLocaleString("en-IN")}</AdminBadge> : <AdminBadge tone="warning">Not saved yet</AdminBadge>}
          <button type="button" className="brand-btn-primary px-5 py-3" disabled={isPending || !hasUnsavedChanges} onClick={() => void saveOrder()}>
            {isPending ? "Saving..." : "Save layout order"}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {orderedSections.map((section, index) => (
          <div
            key={section.key}
            draggable
            onDragStart={() => setDraggedKey(section.key)}
            onDragEnd={() => setDraggedKey(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedKey) moveSection(draggedKey, section.key);
              setDraggedKey(null);
            }}
            className={`grid gap-4 rounded-[24px] border p-4 transition md:grid-cols-[auto_minmax(0,1fr)] ${
              draggedKey === section.key ? "border-brand-gold bg-white shadow-[0_18px_40px_rgba(65,42,17,0.08)]" : "border-brand-sand/40 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-brand-sand/50 bg-[#fcfaf5] p-3 text-brand-warm">
                <GripVertical size={16} />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-brown text-sm font-medium text-white">{index + 1}</div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-medium text-brand-brown">{section.label}</p>
                <AdminBadge tone="default">{section.key}</AdminBadge>
              </div>
              <p className="mt-1 text-sm text-brand-warm">{section.description}</p>
            </div>
          </div>
        ))}
      </div>

      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
