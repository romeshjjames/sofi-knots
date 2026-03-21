"use client";

import { useState, useTransition } from "react";

type Option = {
  id: string;
  name: string;
  slug: string;
};

type ProductCreateFormProps = {
  categories: Option[];
  collections: Option[];
};

const initialState = {
  name: "",
  slug: "",
  priceInr: "",
  originalPriceInr: "",
  categoryId: "",
  collectionId: "",
  shortDescription: "",
  description: "",
  badge: "",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  featuredImageUrl: "",
};

export function ProductCreateForm({ categories, collections }: ProductCreateFormProps) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateField(name: keyof typeof initialState, value: string) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "name" && !current.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleUpload(file: File) {
    setIsUploading(true);
    setMessage(null);
    const payload = new FormData();
    payload.append("file", file);
    payload.append("folder", "products");

    const response = await fetch("/api/admin/storage/upload", {
      method: "POST",
      body: payload,
    });
    const body = await response.json();
    setIsUploading(false);

    if (!response.ok) {
      setMessage(body.error || "Image upload failed.");
      return;
    }

    setForm((current) => ({ ...current, featuredImageUrl: body.publicUrl }));
    setMessage("Image uploaded successfully.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          priceInr: Number(form.priceInr),
          originalPriceInr: form.originalPriceInr ? Number(form.originalPriceInr) : null,
          categoryId: form.categoryId || null,
          collectionId: form.collectionId || null,
          shortDescription: form.shortDescription,
          description: form.description,
          badge: form.badge || null,
          featuredImageUrl: form.featuredImageUrl || null,
          seoTitle: form.seoTitle || form.name,
          seoDescription: form.seoDescription || form.shortDescription || form.description,
          seoKeywords: form.seoKeywords
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Failed to create product.");
        return;
      }

      setMessage("Product created successfully. Refreshing catalog view...");
      setForm(initialState);
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-sm border border-brand-sand/40 p-6">
      <h2 className="font-serif text-2xl text-brand-brown">Create Product</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="brand-input" placeholder="Product name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
        <input className="brand-input" placeholder="Slug" value={form.slug} onChange={(event) => updateField("slug", slugify(event.target.value))} required />
        <input className="brand-input" placeholder="Price in INR" type="number" min="1" value={form.priceInr} onChange={(event) => updateField("priceInr", event.target.value)} required />
        <input className="brand-input" placeholder="Compare at price (optional)" type="number" min="1" value={form.originalPriceInr} onChange={(event) => updateField("originalPriceInr", event.target.value)} />
        <select className="brand-input" value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select className="brand-input" value={form.collectionId} onChange={(event) => updateField("collectionId", event.target.value)}>
          <option value="">Select collection</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
        <input className="brand-input" placeholder="Badge (optional)" value={form.badge} onChange={(event) => updateField("badge", event.target.value)} />
        <input className="brand-input" placeholder="SEO title" value={form.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} />
      </div>
      <input className="brand-input" placeholder="Short description" value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} />
      <textarea className="brand-input min-h-32" placeholder="Description" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
      <textarea className="brand-input min-h-24" placeholder="SEO description" value={form.seoDescription} onChange={(event) => updateField("seoDescription", event.target.value)} />
      <input className="brand-input" placeholder="SEO keywords separated by commas" value={form.seoKeywords} onChange={(event) => updateField("seoKeywords", event.target.value)} />
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input className="brand-input" placeholder="Featured image URL or upload below" value={form.featuredImageUrl} onChange={(event) => updateField("featuredImageUrl", event.target.value)} />
        <label className="brand-btn-outline cursor-pointer">
          {isUploading ? "Uploading..." : "Upload image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
        </label>
      </div>
      <button type="submit" className="brand-btn-primary w-full sm:w-fit" disabled={isPending || isUploading}>
        {isPending ? "Saving..." : "Create Product"}
      </button>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </form>
  );
}
