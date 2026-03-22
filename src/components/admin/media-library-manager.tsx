"use client";

import { Copy, Image as ImageIcon, Search, Trash2, Upload, Video } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import type { MediaAssetRecord } from "@/lib/media-library";

type Props = {
  initialAssets: MediaAssetRecord[];
};

type MediaType = "all" | "image" | "video" | "icon" | "banner" | "file";

export function MediaLibraryManager({ initialAssets }: Props) {
  const [assets, setAssets] = useState(initialAssets);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType>("all");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [altText, setAltText] = useState("");
  const [folder, setFolder] = useState("media-library");
  const [message, setMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  const visibleAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return assets.filter((asset) => {
      const haystack = [asset.fileName, asset.altText ?? "", asset.category ?? "", asset.tags.join(" "), asset.path].join(" ").toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesType = typeFilter === "all" || asset.mediaType === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [assets, query, typeFilter]);

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setMessage("Media URL copied. You can paste it into a page section image field.");
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder || "media-library");
    formData.append("altText", altText);
    formData.append("category", category);
    formData.append("tags", tags);
    formData.append("mediaType", file.type.startsWith("video/") ? "video" : "image");

    const response = await fetch("/api/admin/storage/upload", {
      method: "POST",
      body: formData,
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Upload failed.");
      return;
    }

    const reload = await fetch("/api/admin/media");
    const payload = await reload.json();
    if (reload.ok) {
      setAssets(payload.assets);
    }

    setMessage("Media uploaded. Copy the URL and paste it into the relevant page or section image field.");
  }

  async function deleteAsset(asset: MediaAssetRecord) {
    const response = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: asset.id, path: asset.path }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Delete failed.");
      return;
    }
    setAssets((current) => current.filter((entry) => entry.id !== asset.id));
    setDeleteTarget(null);
    setMessage("Media deleted from the library.");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-slate-950">Upload media</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Upload images, banners, icons, or videos once, then copy the public URL into page, blog, banner, or collection content.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <input
            className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            placeholder="Alt text"
          />
          <input
            className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category"
          />
          <input
            className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            placeholder="Folder"
          />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags separated by comma"
          />
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            <Upload size={16} />
            Upload
            <input
              type="file"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                startTransition(async () => uploadFile(file));
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-slate-950">Media library</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Open Media Library, upload assets, then copy the URL and reuse it across pages, blog, products, and banners.
            </p>
          </div>
          <div className="text-sm text-slate-500">{visibleAssets.length} assets</div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="flex items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-500">
            <Search size={16} />
            <input
              className="w-full bg-transparent outline-none placeholder:text-slate-400"
              placeholder="Search file name, alt text, category, tags"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700 outline-none"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as MediaType)}
          >
            <option value="all">All media</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="icon">Icons</option>
            <option value="banner">Banners</option>
            <option value="file">Files</option>
          </select>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleAssets.map((asset) => (
            <article key={asset.id} className="overflow-hidden rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd]">
              <div className="relative aspect-[1.15] overflow-hidden bg-[#eef2f6]">
                {asset.mediaType === "image" || asset.mediaType === "banner" ? (
                  <img src={asset.publicUrl} alt={asset.altText || asset.fileName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    {asset.mediaType === "video" ? <Video size={30} /> : <ImageIcon size={30} />}
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <h3 className="truncate text-sm font-medium text-slate-900">{asset.fileName}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{asset.category || "Uncategorized"}</p>
                </div>
                {asset.altText ? <p className="text-sm leading-6 text-slate-600">{asset.altText}</p> : null}
                {asset.tags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#dfe5eb] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="rounded-2xl border border-[#e7eaee] bg-white px-3 py-2 text-xs leading-5 text-slate-500">
                  <span className="font-medium text-slate-700">URL:</span> {asset.publicUrl}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#e7eaee] bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => copyUrl(asset.publicUrl)}
                  >
                    <Copy size={15} />
                    Copy URL
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-3 py-2.5 text-rose-600 transition hover:bg-rose-50"
                    onClick={() => setDeleteTarget(asset)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!visibleAssets.length ? (
            <div className="rounded-[24px] border border-dashed border-[#d8dee6] bg-[#fbfcfd] p-6 text-sm leading-6 text-slate-500">
              No media found yet. Upload a new asset above, then paste its URL into a page, blog, collection, or product section.
            </div>
          ) : null}
        </div>
      </section>

      {message ? <p className="text-sm text-slate-600">{isPending ? "Working..." : message}</p> : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-slate-900">Delete media?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the selected file from the media library and Supabase storage. Existing pasted URLs will stop working.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-2xl border border-[#d8dde3] px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
                onClick={() => startTransition(async () => deleteAsset(deleteTarget))}
              >
                Confirm delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
