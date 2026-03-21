"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { GripVertical, ImagePlus, Layers3, Save } from "lucide-react";
import { AdminBadge } from "@/components/admin/admin-shell";

type CollectionItem = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string | null;
};

type Props = {
  collections: CollectionItem[];
  initialCollectionIds: string[];
  updatedAt: string | null;
};

function orderCollections(collections: CollectionItem[], orderedIds: string[]) {
  const orderMap = new Map<string, number>(orderedIds.map((id, index): [string, number] => [id, index]));
  return [...collections].sort((left, right) => {
    const leftId = left.id ?? left.slug;
    const rightId = right.id ?? right.slug;
    const leftIndex = orderMap.get(leftId);
    const rightIndex = orderMap.get(rightId);

    if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
    if (leftIndex !== undefined) return -1;
    if (rightIndex !== undefined) return 1;
    return left.title.localeCompare(right.title);
  });
}

export function CollectionMerchandisingManager({ collections, initialCollectionIds, updatedAt }: Props) {
  const [orderedCollections, setOrderedCollections] = useState(() => orderCollections(collections, initialCollectionIds));
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(updatedAt);
  const [isPending, startTransition] = useTransition();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const initialOrder = useMemo(() => orderCollections(collections, initialCollectionIds), [collections, initialCollectionIds]);

  useEffect(() => {
    setOrderedCollections(initialOrder);
    setSavedAt(updatedAt);
  }, [initialOrder, updatedAt]);

  const hasUnsavedChanges =
    orderedCollections.map((collection) => collection.id ?? collection.slug).join("|") !==
    initialOrder.map((collection) => collection.id ?? collection.slug).join("|");

  function moveCollection(fromId: string, toId: string) {
    if (fromId === toId) return;
    setOrderedCollections((current) => {
      const next = [...current];
      const fromIndex = next.findIndex((collection) => (collection.id ?? collection.slug) === fromId);
      const toIndex = next.findIndex((collection) => (collection.id ?? collection.slug) === toId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  async function saveCollectionImage(itemId: string) {
    const collection = orderedCollections.find((entry) => (entry.id ?? entry.slug) === itemId);
    if (!collection || !collection.id) return;

    const response = await fetch(`/api/admin/collections/${collection.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: collection.title,
        slug: collection.slug,
        description: collection.description,
        imageUrl: collection.imageUrl || null,
      }),
    });
    const body = await response.json();
    setMessage(response.ok ? `${collection.title} updated.` : body.error || "Failed to update collection.");
  }

  async function uploadCollectionImage(itemId: string, file: File) {
    setUploadingId(itemId);
    setMessage(null);
    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", "collections");
    const response = await fetch("/api/admin/storage/upload", {
      method: "POST",
      body: payload,
    });
    const body = await response.json();
    setUploadingId(null);

    if (!response.ok) {
      setMessage(body.error || "Collection image upload failed.");
      return;
    }

    setOrderedCollections((current) =>
      current.map((collection) => ((collection.id ?? collection.slug) === itemId ? { ...collection, imageUrl: body.publicUrl } : collection)),
    );
    setMessage("Collection image uploaded. Save card changes to persist it.");
  }

  async function saveOrder() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/merchandising/collections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionIds: orderedCollections.map((collection) => collection.id ?? collection.slug) }),
      });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error || "Failed to save collection order.");
        return;
      }

      setMessage("Collection order saved.");
      setSavedAt(body.merchandising?.updatedAt ?? new Date().toISOString());
      window.location.reload();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-brand-brown">
            <Layers3 size={16} className="text-brand-gold" />
            Collection ordering
          </div>
          <p className="mt-1 text-sm text-brand-warm">Arrange collection cards for the homepage and collections landing page. This order is now persisted in merchandising settings.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          {savedAt ? <AdminBadge tone="info">Saved {new Date(savedAt).toLocaleString("en-IN")}</AdminBadge> : <AdminBadge tone="warning">Not saved yet</AdminBadge>}
          <button type="button" className="brand-btn-primary px-5 py-3" disabled={isPending || !hasUnsavedChanges} onClick={() => void saveOrder()}>
            {isPending ? "Saving..." : "Save order"}
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {orderedCollections.map((collection, index) => {
          const itemId = collection.id ?? collection.slug;
          return (
            <div
              key={itemId}
              draggable
              onDragStart={() => setDraggedId(itemId)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedId) moveCollection(draggedId, itemId);
                setDraggedId(null);
              }}
              className={`grid gap-4 rounded-[24px] border p-4 transition md:grid-cols-[auto_minmax(0,1fr)] ${
                draggedId === itemId ? "border-brand-gold bg-white shadow-[0_18px_40px_rgba(65,42,17,0.08)]" : "border-brand-sand/40 bg-white"
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
                  <p className="text-base font-medium text-brand-brown">{collection.title}</p>
                  <AdminBadge tone="default">{collection.slug}</AdminBadge>
                </div>
                <p className="mt-1 text-sm text-brand-warm">{collection.description}</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[120px_minmax(0,1fr)_auto]">
                  <div className="overflow-hidden rounded-2xl border border-brand-sand/40 bg-[#fcfaf5]">
                    {collection.imageUrl ? (
                      <img src={collection.imageUrl} alt={collection.title} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="flex h-24 items-center justify-center text-xs uppercase tracking-[0.16em] text-brand-taupe">No image</div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <input
                      className="brand-input"
                      value={collection.imageUrl ?? ""}
                      placeholder="Collection image URL"
                      onChange={(event) =>
                        setOrderedCollections((current) =>
                          current.map((entry) => ((entry.id ?? entry.slug) === itemId ? { ...entry, imageUrl: event.target.value } : entry)),
                        )
                      }
                    />
                    <p className="text-xs text-brand-taupe">Upload or paste the image used for collection cards across the storefront.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 lg:flex-col">
                    <label className="brand-btn-outline cursor-pointer justify-center px-4 py-2">
                      <ImagePlus size={15} />
                      {uploadingId === itemId ? "Uploading..." : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) void uploadCollectionImage(itemId, file);
                        }}
                      />
                    </label>
                    <button type="button" className="brand-btn-outline justify-center px-4 py-2" onClick={() => void saveCollectionImage(itemId)}>
                      <Save size={15} />
                      Save card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
