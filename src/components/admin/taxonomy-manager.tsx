"use client";

import { useMemo, useState, useTransition } from "react";
import { GripVertical, Save } from "lucide-react";

type Item = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
};

type TaxonomyManagerProps = {
  title: string;
  endpoint: "/api/admin/categories" | "/api/admin/collections";
  items: Item[];
};

export function TaxonomyManager({ title, endpoint, items }: TaxonomyManagerProps) {
  const [createState, setCreateState] = useState({
    name: "",
    slug: "",
    description: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });
  const [records, setRecords] = useState(items);
  const [message, setMessage] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const orderedRecords = useMemo(
    () => [...records].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0) || left.name.localeCompare(right.name)),
    [records],
  );

  function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function singularTitle() {
    return title.endsWith("s") ? title.slice(0, -1) : title;
  }

  function moveRecord(fromId: string, toId: string) {
    if (fromId === toId) return;
    setRecords((current) => {
      const next = [...current].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
      const fromIndex = next.findIndex((record) => record.id === fromId);
      const toIndex = next.findIndex((record) => record.id === toId);
      if (fromIndex === -1 || toIndex === -1) return current;
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((record, index) => ({ ...record, sortOrder: index }));
    });
  }

  async function saveOrder() {
    setMessage(null);
    startTransition(async () => {
      for (const [index, item] of orderedRecords.entries()) {
        const response = await fetch(`${endpoint}/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...item, sortOrder: index }),
        });
        if (!response.ok) {
          const body = await response.json();
          setMessage(body.error || `Failed to save ${title.toLowerCase()} order.`);
          return;
        }
      }

      setMessage(`${title} order saved.`);
      window.location.reload();
    });
  }

  return (
    <div className="grid gap-4 rounded-sm border border-brand-sand/40 p-6">
      <div>
        <h2 className="font-serif text-2xl text-brand-brown">{title}</h2>
        <p className="text-sm text-brand-warm">Create, edit, and remove supporting taxonomies for navigation and SEO landing pages.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="brand-input"
          value={createState.name}
          placeholder="Name"
          onChange={(event) =>
            setCreateState((current) => ({
              ...current,
              name: event.target.value,
              slug: current.slug || slugify(event.target.value),
            }))
          }
        />
        <input
          className="brand-input"
          value={createState.slug}
          placeholder="Slug"
          onChange={(event) => setCreateState((current) => ({ ...current, slug: slugify(event.target.value) }))}
        />
      </div>
      <input className="brand-input" value={createState.description} placeholder="Description" onChange={(event) => setCreateState((current) => ({ ...current, description: event.target.value }))} />
      <input className="brand-input" value={createState.seoTitle} placeholder="SEO title" onChange={(event) => setCreateState((current) => ({ ...current, seoTitle: event.target.value }))} />
      <textarea className="brand-input min-h-24" value={createState.seoDescription} placeholder="SEO description" onChange={(event) => setCreateState((current) => ({ ...current, seoDescription: event.target.value }))} />
      <input className="brand-input" value={createState.seoKeywords} placeholder="SEO keywords" onChange={(event) => setCreateState((current) => ({ ...current, seoKeywords: event.target.value }))} />
      <button
        type="button"
        className="brand-btn-primary w-full sm:w-fit"
        disabled={isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: createState.name,
                slug: createState.slug,
                description: createState.description,
                seoTitle: createState.seoTitle || createState.name,
                seoDescription: createState.seoDescription || createState.description,
                seoKeywords: createState.seoKeywords.split(",").map((value) => value.trim()).filter(Boolean),
                sortOrder: orderedRecords.length,
              }),
            });
            const body = await response.json();
            if (!response.ok) {
              setMessage(body.error || `Failed to create ${singularTitle().toLowerCase()}.`);
              return;
            }

            setMessage(`${singularTitle()} created successfully.`);
            setCreateState({ name: "", slug: "", description: "", seoTitle: "", seoDescription: "", seoKeywords: "" });
            window.location.reload();
          });
        }}
      >
        {isPending ? "Saving..." : `Add ${singularTitle()}`}
      </button>
      <div className="space-y-3 rounded-sm bg-brand-cream p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-brand-brown">Manage existing {title.toLowerCase()}</p>
          <button type="button" className="brand-btn-outline px-4 py-2" disabled={isPending || !orderedRecords.length} onClick={() => void saveOrder()}>
            <Save size={15} />
            Save order
          </button>
        </div>
        {orderedRecords.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDraggedId(item.id)}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedId) moveRecord(draggedId, item.id);
              setDraggedId(null);
            }}
            className={`grid gap-3 rounded-sm border p-3 ${draggedId === item.id ? "border-brand-gold bg-white" : "border-brand-sand/30 bg-brand-ivory"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-brand-taupe">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1">
                  <GripVertical size={13} />
                  Position {index + 1}
                </span>
                <span>{item.slug}</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="brand-input"
                value={item.name}
                onChange={(event) =>
                  setRecords((current) => current.map((record) => (record.id === item.id ? { ...record, name: event.target.value } : record)))
                }
              />
              <input
                className="brand-input"
                value={item.slug}
                onChange={(event) =>
                  setRecords((current) => current.map((record) => (record.id === item.id ? { ...record, slug: slugify(event.target.value) } : record)))
                }
              />
            </div>
            <input
              className="brand-input"
              value={item.description ?? ""}
              placeholder="Description"
              onChange={(event) =>
                setRecords((current) => current.map((record) => (record.id === item.id ? { ...record, description: event.target.value } : record)))
              }
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="brand-btn-outline"
                disabled={isPending}
                onClick={() => {
                  setMessage(null);
                  startTransition(async () => {
                    const response = await fetch(`${endpoint}/${item.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(item),
                    });
                    const body = await response.json();
                    setMessage(response.ok ? `${singularTitle()} updated successfully.` : body.error || `Failed to update ${singularTitle().toLowerCase()}.`);
                    if (response.ok) {
                      window.location.reload();
                    }
                  });
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="brand-btn-outline"
                disabled={isPending}
                onClick={() => {
                  setMessage(null);
                  startTransition(async () => {
                    const response = await fetch(`${endpoint}/${item.id}`, { method: "DELETE" });
                    const body = await response.json();
                    setMessage(response.ok ? `${singularTitle()} deleted successfully.` : body.error || `Failed to delete ${singularTitle().toLowerCase()}.`);
                    if (response.ok) {
                      setRecords((current) => current.filter((record) => record.id !== item.id));
                    }
                  });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
