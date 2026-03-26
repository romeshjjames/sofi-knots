"use client";

import { useState } from "react";
import type { AnnouncementBarRecord } from "@/lib/announcement-bar";

export function AnnouncementBarForm({ initial }: { initial: AnnouncementBarRecord }) {
  const [text, setText] = useState(initial.text);
  const [ctaLink, setCtaLink] = useState(initial.ctaLink ?? "");
  const [isActive, setIsActive] = useState(initial.isActive);
  const [startsAt, setStartsAt] = useState(initial.startsAt ? initial.startsAt.slice(0, 16) : "");
  const [endsAt, setEndsAt] = useState(initial.endsAt ? initial.endsAt.slice(0, 16) : "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/admin/announcement-bar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        ctaLink,
        isActive,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
      }),
    });

    const body = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(body.error || "Failed to save announcement bar.");
      return;
    }

    setMessage("Announcement bar updated.");
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-900">Announcement text</span>
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-[#e7eaee] bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300"
              placeholder="Free shipping on orders above Rs. 375. New handcrafted arrivals just dropped."
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-900">CTA link</span>
            <input
              className="h-12 w-full rounded-2xl border border-[#e7eaee] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
              placeholder="/collections"
              value={ctaLink}
              onChange={(event) => setCtaLink(event.target.value)}
            />
          </label>
        </div>

        <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5">
          <div className="space-y-5">
            <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#e7eaee] bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Active</p>
                <p className="mt-1 text-xs text-slate-500">Turn the top announcement bar on or off.</p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="h-4 w-4 accent-[#1f2933]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-900">Start date</span>
              <input
                type="datetime-local"
                className="h-12 w-full rounded-2xl border border-[#e7eaee] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-900">End date</span>
              <input
                type="datetime-local"
                className="h-12 w-full rounded-2xl border border-[#e7eaee] bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-300"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5">
        <p className="text-sm font-medium text-slate-900">Preview</p>
        <div className="mt-4 rounded-2xl bg-[#1f2933] px-4 py-3 text-center text-sm font-medium text-white">
          <span>{text || "Your announcement text will appear here."}</span>
          {ctaLink ? <span className="ml-3 text-[#e8c38f]">Learn more</span> : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save announcement"}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </form>
  );
}
