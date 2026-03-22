"use client";

import { useMemo, useState, useTransition } from "react";
import { ImagePlus, Sparkles, Wand2 } from "lucide-react";

type Option = {
  id: string;
  name: string;
  slug: string;
};

type ProductCreateFormProps = {
  categories: Option[];
  collections: Option[];
};

const salesChannelOptions = [
  { id: "online-store", label: "Online Store" },
  { id: "instagram-shop", label: "Instagram Shop" },
  { id: "whatsapp-orders", label: "WhatsApp Orders" },
  { id: "pop-up-events", label: "Pop-up Events" },
];

const initialState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  categoryId: "",
  vendor: "Sofi Knots",
  tags: "",
  featuredImageUrl: "",
  priceInr: "",
  originalPriceInr: "",
  costPerItem: "",
  sku: "",
  barcode: "",
  inventoryQuantity: "",
  inventoryTracking: true,
  continueSellingWhenOutOfStock: false,
  optionName: "",
  optionValues: "",
  physicalProduct: true,
  weight: "",
  status: "draft",
  collectionId: "",
  salesChannels: ["online-store"],
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
};

export function ProductCreateForm({ categories, collections }: ProductCreateFormProps) {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const chosenCategory = useMemo(() => categories.find((item) => item.id === form.categoryId), [categories, form.categoryId]);
  const chosenCollection = useMemo(() => collections.find((item) => item.id === form.collectionId), [collections, form.collectionId]);

  function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function updateField(name: keyof typeof initialState, value: string | boolean | string[]) {
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "name") {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  function autofillSeo() {
    setForm((current) => ({
      ...current,
      seoTitle: current.seoTitle || `${current.name} | ${current.vendor || "Sofi Knots"}`,
      seoDescription:
        current.seoDescription ||
        current.shortDescription ||
        current.description ||
        `Shop ${current.name} by ${current.vendor || "Sofi Knots"} for handcrafted luxury macrame.`,
      seoKeywords:
        current.seoKeywords ||
        [current.name, current.vendor, chosenCategory?.name, chosenCollection?.name, "handmade macrame", "luxury handmade bag"]
          .filter(Boolean)
          .join(", "),
    }));
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
    setMessage("Product image uploaded successfully.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          shortDescription: form.shortDescription,
          description: form.description,
          categoryId: form.categoryId || null,
          vendor: form.vendor || "Sofi Knots",
          tags: form.tags.split(",").map((value) => value.trim()).filter(Boolean),
          featuredImageUrl: form.featuredImageUrl || null,
          priceInr: Number(form.priceInr),
          originalPriceInr: form.originalPriceInr ? Number(form.originalPriceInr) : null,
          costPerItem: form.costPerItem ? Number(form.costPerItem) : null,
          sku: form.sku || null,
          barcode: form.barcode || null,
          inventoryQuantity: form.inventoryQuantity ? Number(form.inventoryQuantity) : 0,
          inventoryTracking: form.inventoryTracking,
          continueSellingWhenOutOfStock: form.continueSellingWhenOutOfStock,
          physicalProduct: form.physicalProduct,
          weight: form.weight ? Number(form.weight) : null,
          status: form.status,
          collectionId: form.collectionId || null,
          salesChannels: form.salesChannels,
          seoTitle: form.seoTitle || form.name,
          seoDescription: form.seoDescription || form.shortDescription || form.description,
          seoKeywords: form.seoKeywords.split(",").map((value) => value.trim()).filter(Boolean),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error || "Failed to create product.");
        return;
      }

      setMessage("Product created successfully. Refreshing product list...");
      setForm(initialState);
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-[28px] border border-brand-sand/40 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-brand-brown">Add product</h2>
          <p className="mt-1 text-sm text-brand-warm">Follow the same flow as Shopify: details, pricing, inventory, variants, shipping, publishing, SEO, then save.</p>
        </div>
        <button type="button" className="brand-btn-outline px-4 py-2" onClick={autofillSeo}>
          <Wand2 size={15} />
          Auto-fill SEO
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-brand-brown">
              <Sparkles size={16} className="text-brand-gold" />
              Basic details
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="brand-input" placeholder="Product title" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
              <input className="brand-input" placeholder="URL handle" value={form.slug} onChange={(event) => updateField("slug", slugify(event.target.value))} required />
              <select className="brand-input" value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)}>
                <option value="">Category / product type</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input className="brand-input" placeholder="Vendor / brand" value={form.vendor} onChange={(event) => updateField("vendor", event.target.value)} />
              <input className="brand-input md:col-span-2" placeholder="Tags separated by commas" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} />
            </div>
            <input className="brand-input mt-4" placeholder="Short description" value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} />
            <textarea className="brand-input mt-4 min-h-32" placeholder="Description" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
          </section>

          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 text-sm font-medium text-brand-brown">Pricing</div>
            <div className="grid gap-4 md:grid-cols-3">
              <input className="brand-input" placeholder="Price" type="number" min="1" value={form.priceInr} onChange={(event) => updateField("priceInr", event.target.value)} required />
              <input className="brand-input" placeholder="Compare-at price" type="number" min="1" value={form.originalPriceInr} onChange={(event) => updateField("originalPriceInr", event.target.value)} />
              <input className="brand-input" placeholder="Cost per item" type="number" min="0" value={form.costPerItem} onChange={(event) => updateField("costPerItem", event.target.value)} />
            </div>
          </section>

          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 text-sm font-medium text-brand-brown">Inventory</div>
            <div className="grid gap-4 md:grid-cols-3">
              <input className="brand-input" placeholder="SKU" value={form.sku} onChange={(event) => updateField("sku", event.target.value)} />
              <input className="brand-input" placeholder="Barcode" value={form.barcode} onChange={(event) => updateField("barcode", event.target.value)} />
              <input className="brand-input" placeholder="Stock quantity" type="number" min="0" value={form.inventoryQuantity} onChange={(event) => updateField("inventoryQuantity", event.target.value)} />
            </div>
            <div className="mt-4 grid gap-3">
              <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 bg-white px-4 py-3 text-sm text-brand-brown">
                <input type="checkbox" checked={form.inventoryTracking} onChange={(event) => updateField("inventoryTracking", event.target.checked)} />
                Track quantity
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 bg-white px-4 py-3 text-sm text-brand-brown">
                <input type="checkbox" checked={form.continueSellingWhenOutOfStock} onChange={(event) => updateField("continueSellingWhenOutOfStock", event.target.checked)} />
                Continue selling when out of stock
              </label>
            </div>
          </section>

          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 text-sm font-medium text-brand-brown">Variants</div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="brand-input" placeholder="Option name, e.g. Size or Color" value={form.optionName} onChange={(event) => updateField("optionName", event.target.value)} />
              <input className="brand-input" placeholder="Option values, e.g. Small, Medium, Large" value={form.optionValues} onChange={(event) => updateField("optionValues", event.target.value)} />
            </div>
            <p className="mt-3 text-sm text-brand-warm">Save the product first, then use the Variant Manager below to create the actual variant matrix automatically.</p>
          </section>

          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 text-sm font-medium text-brand-brown">Shipping</div>
            <div className="grid gap-4">
              <label className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 bg-white px-4 py-3 text-sm text-brand-brown">
                <input type="checkbox" checked={form.physicalProduct} onChange={(event) => updateField("physicalProduct", event.target.checked)} />
                This is a physical product
              </label>
              <input className="brand-input" placeholder="Weight in grams" type="number" min="0" value={form.weight} onChange={(event) => updateField("weight", event.target.value)} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 text-sm font-medium text-brand-brown">Product images</div>
            <div className="overflow-hidden rounded-[24px] border border-dashed border-brand-sand/50 bg-white">
              {form.featuredImageUrl ? (
                <img src={form.featuredImageUrl} alt={form.name || "Product preview"} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center text-sm text-brand-taupe">Product image preview</div>
              )}
            </div>
            <div className="mt-4 grid gap-3">
              <input className="brand-input" placeholder="Product image URL" value={form.featuredImageUrl} onChange={(event) => updateField("featuredImageUrl", event.target.value)} />
              <label className="brand-btn-outline cursor-pointer justify-center px-4 py-2">
                <ImagePlus size={15} />
                {isUploading ? "Uploading..." : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && void handleUpload(event.target.files[0])} />
              </label>
            </div>
          </section>

          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 text-sm font-medium text-brand-brown">Publishing</div>
            <div className="grid gap-4">
              <select className="brand-input" value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
              <select className="brand-input" value={form.collectionId} onChange={(event) => updateField("collectionId", event.target.value)}>
                <option value="">Assign to collection</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
              <div className="grid gap-2">
                {salesChannelOptions.map((channel) => (
                  <label key={channel.id} className="flex items-center gap-3 rounded-2xl border border-brand-sand/40 bg-white px-4 py-3 text-sm text-brand-brown">
                    <input
                      type="checkbox"
                      checked={form.salesChannels.includes(channel.id)}
                      onChange={(event) =>
                        updateField(
                          "salesChannels",
                          event.target.checked
                            ? [...new Set([...form.salesChannels, channel.id])]
                            : form.salesChannels.filter((value) => value !== channel.id),
                        )
                      }
                    />
                    {channel.label}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-brand-sand/40 bg-[#fcfaf5] p-4">
            <div className="mb-4 text-sm font-medium text-brand-brown">Search engine listing</div>
            <div className="rounded-2xl border border-brand-sand/40 bg-white p-4">
              <div className="text-lg text-[#1a0dab]">{form.seoTitle || form.name || "Product title"}</div>
              <div className="mt-1 text-sm text-emerald-700">{`https://sofi-knots.vercel.app/product/${form.slug || "new-product"}`}</div>
              <div className="mt-2 text-sm text-brand-warm">{form.seoDescription || "Add a meta description for search previews."}</div>
            </div>
            <div className="mt-4 grid gap-4">
              <input className="brand-input" placeholder="Page title" value={form.seoTitle} onChange={(event) => updateField("seoTitle", event.target.value)} />
              <textarea className="brand-input min-h-24" placeholder="Meta description" value={form.seoDescription} onChange={(event) => updateField("seoDescription", event.target.value)} />
              <input className="brand-input" placeholder="Keywords separated by commas" value={form.seoKeywords} onChange={(event) => updateField("seoKeywords", event.target.value)} />
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="brand-btn-primary" disabled={isPending || isUploading}>
          {isPending ? "Saving..." : "Save product"}
        </button>
        <button type="submit" className="brand-btn-outline" disabled={isPending || isUploading} onClick={() => setForm((current) => ({ ...current, status: "draft" }))}>
          Save as draft
        </button>
      </div>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </form>
  );
}
