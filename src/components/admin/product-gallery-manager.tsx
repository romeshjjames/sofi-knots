"use client";

import { useEffect, useState } from "react";
import { GripVertical, ImagePlus, Trash2 } from "lucide-react";
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium text-brand-brown">Gallery</h5>
          <p className="text-sm text-brand-warm">Add supporting product photos and keep their order clean.</p>
        </div>
        {canEdit ? (
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
        ) : null}
      </div>

      <div className="space-y-3">
        {images.map((image, index) => (
          <div key={image.id} className="rounded-2xl border border-brand-sand/40 bg-[#fcfaf5] p-3">
            <div className="grid gap-3 md:grid-cols-[96px_1fr_auto] md:items-center">
              <img src={image.imageUrl} alt={image.altText || `Product image ${index + 1}`} className="h-24 w-24 rounded-xl object-cover" />
              <div className="grid gap-3">
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
                <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                  <input
                    className="brand-input"
                    type="number"
                    value={image.sortOrder}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((entry) => (entry.id === image.id ? { ...entry, sortOrder: Number(event.target.value) } : entry)),
                      )
                    }
                  />
                  <div className="flex items-center gap-2 text-xs text-brand-taupe">
                    <GripVertical size={14} />
                    Sort order controls gallery placement
                  </div>
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
