"use client";

import { useEffect, useMemo, useState } from "react";
import { GripVertical, ImagePlus, Save, Star, Trash2 } from "lucide-react";
import type { ProductImageRecord } from "@/lib/admin-data";

type Props = {
  productId: string;
  canEdit?: boolean;
};

export function ProductGalleryManager({ productId, canEdit = true }: Props) {
  const [images, setImages] = useState<ProductImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const orderedImages = useMemo(() => [...images].sort((left, right) => left.sortOrder - right.sortOrder), [images]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/admin/products/${productId}/images`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        setImages(body.images ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function uploadGalleryImage(file: File) {
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", `products/${productId}/gallery`);
    const uploadResponse = await fetch("/api/admin/storage/upload", { method: "POST", body: formData });
    const uploadBody = await uploadResponse.json();
    if (!uploadResponse.ok) {
      setUploading(false);
      setMessage(uploadBody.error || "Upload failed.");
      return;
    }
    const response = await fetch(`/api/admin/products/${productId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: uploadBody.publicUrl,
        altText: "",
        sortOrder: images.length,
      }),
    });
    const body = await response.json();
    setUploading(false);
    if (!response.ok) {
      setMessage(body.error || "Failed to attach image.");
      return;
    }
    setImages((current) => [...current, body.image]);
    setMessage("Gallery image added.");
  }

  async function saveImage(image: ProductImageRecord) {
    const response = await fetch(`/api/admin/products/${productId}/images/${image.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(image),
    });
    const body = await response.json();
    setMessage(response.ok ? "Gallery updated." : body.error || "Failed to save image.");
  }

  async function saveOrder() {
    const normalized = orderedImages.map((image, index) => ({
      ...image,
      sortOrder: index,
    }));

    const response = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: normalized.map((image) => ({
          id: image.id,
          altText: image.altText,
          sortOrder: image.sortOrder,
        })),
      }),
    });
    const body = await response.json();
    setMessage(response.ok ? "Gallery order saved." : body.error || "Failed to save gallery order.");
    if (response.ok) {
      setImages(body.images ?? normalized);
    }
  }

  async function removeImage(imageId: string) {
    const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: "DELETE" });
    const body = await response.json();
    setMessage(response.ok ? "Image removed." : body.error || "Failed to remove image.");
    if (response.ok) {
      setImages((current) => current.filter((image) => image.id !== imageId));
    }
  }

  if (loading) {
    return <p className="text-sm text-brand-warm">Loading gallery...</p>;
  }

  function moveImage(fromId: string, toId: string) {
    if (fromId === toId) return;
    setImages((current) => {
      const next = [...current].sort((left, right) => left.sortOrder - right.sortOrder);
      const fromIndex = next.findIndex((image) => image.id === fromId);
      const toIndex = next.findIndex((image) => image.id === toId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((image, index) => ({ ...image, sortOrder: index }));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium text-brand-brown">Gallery</h5>
          <p className="text-sm text-brand-warm">Add supporting product photos, drag them into the right story order, and keep the first image ready for hero use.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <>
              <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => void saveOrder()} disabled={!orderedImages.length}>
                <Save size={15} />
                Save order
              </button>
              <label className="brand-btn-outline cursor-pointer justify-center gap-2 px-4 py-2">
                <ImagePlus size={16} />
                {uploading ? "Uploading..." : "Add image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadGalleryImage(file);
                  }}
                />
              </label>
            </>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {orderedImages.map((image, index) => (
          <div
            key={image.id}
            draggable={canEdit}
            onDragStart={() => setDraggedId(image.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId) moveImage(draggedId, image.id);
              setDraggedId(null);
            }}
            className={`rounded-2xl border p-3 ${draggedId === image.id ? "border-brand-gold bg-white" : "border-brand-sand/40 bg-[#fcfaf5]"}`}
          >
            <div className="grid gap-3 md:grid-cols-[96px_1fr_auto] md:items-center">
              <img src={image.imageUrl} alt={image.altText || `Product image ${index + 1}`} className="h-24 w-24 rounded-xl object-cover" />
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-brand-taupe">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
                    <GripVertical size={13} />
                    Position {index + 1}
                  </span>
                  {index === 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-brown px-3 py-1 text-white">
                      <Star size={12} />
                      Lead image
                    </span>
                  ) : null}
                </div>
                <input
                  className="brand-input"
                  value={image.altText ?? ""}
                  onChange={(event) =>
                    setImages((current) =>
                      current.map((entry) => (entry.id === image.id ? { ...entry, altText: event.target.value } : entry)),
                    )
                  }
                  placeholder="Alt text"
                />
                <div className="flex items-center gap-2 text-xs text-brand-taupe">
                  <GripVertical size={14} />
                  Drag and drop to reorder this gallery visually, then save the order.
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" className="brand-btn-outline px-4 py-2" onClick={() => void saveImage(image)}>
                  Save
                </button>
                <button type="button" className="brand-btn-outline border-rose-300 px-4 py-2 text-rose-700 hover:bg-rose-600 hover:text-white" onClick={() => void removeImage(image.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
