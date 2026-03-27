"use client";

import { useMemo, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import type { ColorSwatch } from "@/lib/color-swatches";

type Props = {
  initialSwatches: ColorSwatch[];
};

type FormState = {
  id: string | null;
  name: string;
  hex: string;
  imageUrl: string;
  isEnabled: boolean;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  hex: "",
  imageUrl: "",
  isEnabled: true,
};

export function ColorSwatchesManager({ initialSwatches }: Props) {
  const [swatches, setSwatches] = useState(initialSwatches);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const enabledCount = useMemo(() => swatches.filter((swatch) => swatch.isEnabled).length, [swatches]);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "media-library/color-swatches");
    formData.append("category", "Color Swatches");
    formData.append("mediaType", "image");

    const response = await fetch("/api/admin/storage/upload", {
      method: "POST",
      body: formData,
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body.error || "Upload failed.");
    }
    return String(body.publicUrl || "");
  }

  async function refreshSwatches() {
    const response = await fetch("/api/admin/color-swatches", { cache: "no-store" });
    const body = await response.json();
    if (response.ok) {
      setSwatches(Array.isArray(body.swatches) ? body.swatches : []);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      name: form.name,
      hex: form.hex || null,
      imageUrl: form.imageUrl || null,
      isEnabled: form.isEnabled,
    };

    const response = await fetch(form.id ? `/api/admin/color-swatches/${form.id}` : "/api/admin/color-swatches", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(body.error || "Unable to save color swatch.");
      return;
    }

    await refreshSwatches();
    setForm(emptyForm);
    setMessage(form.id ? "Color swatch updated." : "Color swatch created.");
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this color swatch?");
    if (!confirmed) return;

    const response = await fetch(`/api/admin/color-swatches/${id}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || "Unable to delete color swatch.");
      return;
    }

    await refreshSwatches();
    if (form.id === id) setForm(emptyForm);
    setMessage("Color swatch deleted.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[24px] border border-[#e7eaee] bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[#eef2f6] px-5 py-4">
          <div>
            <h3 className="font-serif text-2xl text-slate-950">Color swatches</h3>
            <p className="mt-1 text-sm text-slate-600">{enabledCount} enabled of {swatches.length} total swatches.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#eef2f6] text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="px-5 py-4">Color Name</th>
                <th className="px-5 py-4">Swatch Preview</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {swatches.map((swatch) => (
                <tr key={swatch.id} className="border-b border-[#f2f4f7] text-sm text-slate-700">
                  <td className="px-5 py-4 font-medium text-slate-900">{swatch.name}</td>
                  <td className="px-5 py-4">
                    {swatch.imageUrl ? (
                      <div className="flex items-center gap-3">
                        <img src={swatch.imageUrl} alt={swatch.name} className="h-10 w-10 rounded-xl border border-[#e7eaee] object-cover" />
                        <span className="text-xs text-slate-500">Image swatch</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 rounded-xl border border-[#e7eaee]" style={{ backgroundColor: swatch.hex || "#f3f1ec" }} />
                        <span className="text-xs text-slate-500">{swatch.hex || "No color code"}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${swatch.isEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {swatch.isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: swatch.id,
                            name: swatch.name,
                            hex: swatch.hex || "",
                            imageUrl: swatch.imageUrl || "",
                            isEnabled: swatch.isEnabled,
                          })
                        }
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e7eaee] text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        aria-label={`Edit ${swatch.name}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(swatch.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f3d5d5] text-rose-600 transition hover:bg-rose-50"
                        aria-label={`Delete ${swatch.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <form className="space-y-5 rounded-[24px] border border-[#e7eaee] bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-slate-950">{form.id ? "Edit color" : "Add new color"}</h3>
            <p className="mt-1 text-sm text-slate-600">Choose a HEX swatch or upload a swatch image.</p>
          </div>
          {!form.id ? (
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1f2933] text-white">
              <Plus size={18} />
            </div>
          ) : null}
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-900">Color name</span>
          <input
            className="h-12 w-full rounded-2xl border border-[#e7eaee] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Beige"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-900">HEX color</span>
            <input
              type="color"
              className="h-12 w-full rounded-2xl border border-[#e7eaee] bg-white px-2"
              value={form.hex || "#d8c1a1"}
              onChange={(event) => setForm((current) => ({ ...current, hex: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-900">Swatch image URL</span>
            <div className="flex gap-3">
              <input
                className="h-12 w-full rounded-2xl border border-[#e7eaee] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
                value={form.imageUrl}
                onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="https://..."
              />
              <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#e7eaee] px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                <ImagePlus size={16} />
                Upload
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setSaving(true);
                    setMessage(null);
                    try {
                      const uploadedUrl = await uploadImage(file);
                      setForm((current) => ({ ...current, imageUrl: uploadedUrl }));
                      setMessage("Swatch image uploaded.");
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : "Upload failed.");
                    } finally {
                      setSaving(false);
                      event.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
          </label>
        </div>

        <label className="flex items-center justify-between rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">Enabled</p>
            <p className="mt-1 text-xs text-slate-500">Show this swatch in the custom order color dropdown.</p>
          </div>
          <input
            type="checkbox"
            checked={form.isEnabled}
            onChange={(event) => setForm((current) => ({ ...current, isEnabled: event.target.checked }))}
            className="h-4 w-4 accent-[#1f2933]"
          />
        </label>

        <div className="rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] p-4">
          <p className="text-sm font-medium text-slate-900">Preview</p>
          <div className="mt-4 flex items-center gap-3">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt={form.name || "Swatch preview"} className="h-12 w-12 rounded-xl border border-[#e7eaee] object-cover" />
            ) : (
              <span className="h-12 w-12 rounded-xl border border-[#e7eaee]" style={{ backgroundColor: form.hex || "#f3f1ec" }} />
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">{form.name || "Untitled color"}</p>
              <p className="text-xs text-slate-500">{form.isEnabled ? "Enabled" : "Disabled"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : form.id ? "Update color" : "Save color"}
          </button>
          <button
            type="button"
            onClick={() => setForm(emptyForm)}
            className="rounded-2xl border border-[#e7eaee] px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300"
          >
            Reset
          </button>
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </form>
    </div>
  );
}
