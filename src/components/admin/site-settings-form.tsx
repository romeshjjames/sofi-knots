"use client";

import { useState, useTransition } from "react";
import type { SiteSettingsRecord } from "@/lib/admin-data";

type Props = {
  settings: SiteSettingsRecord;
};

export function SiteSettingsForm({ settings }: Props) {
  const [form, setForm] = useState({
    ...settings,
    defaultMetaKeywordsText: settings.defaultMetaKeywords.join(", "),
    socialLinksText: Object.entries(settings.socialLinks)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n"),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function parseSocialLinks(text: string) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, line) => {
        const [key, ...rest] = line.split(":");
        if (key && rest.length) {
          acc[key.trim()] = rest.join(":").trim();
        }
        return acc;
      }, {});
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input className="brand-input" value={form.siteName} onChange={(event) => setForm((current) => ({ ...current, siteName: event.target.value }))} placeholder="Site name" />
        <input className="brand-input" value={form.siteUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, siteUrl: event.target.value }))} placeholder="Site URL" />
        <input className="brand-input" value={form.supportEmail ?? ""} onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))} placeholder="Support email" />
        <input className="brand-input" value={form.supportPhone ?? ""} onChange={(event) => setForm((current) => ({ ...current, supportPhone: event.target.value }))} placeholder="Support phone" />
      </div>
      <input className="brand-input" value={form.defaultMetaTitle ?? ""} onChange={(event) => setForm((current) => ({ ...current, defaultMetaTitle: event.target.value }))} placeholder="Default meta title" />
      <textarea className="brand-input min-h-24" value={form.defaultMetaDescription ?? ""} onChange={(event) => setForm((current) => ({ ...current, defaultMetaDescription: event.target.value }))} placeholder="Default meta description" />
      <input className="brand-input" value={form.defaultMetaKeywordsText} onChange={(event) => setForm((current) => ({ ...current, defaultMetaKeywordsText: event.target.value }))} placeholder="Default SEO keywords" />
      <textarea className="brand-input min-h-28" value={form.socialLinksText} onChange={(event) => setForm((current) => ({ ...current, socialLinksText: event.target.value }))} placeholder="Social links, one per line. Example: instagram: https://instagram.com/..." />
      <button
        type="button"
        className="brand-btn-primary w-full sm:w-fit"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const response = await fetch("/api/admin/settings/site", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: form.id,
                siteName: form.siteName,
                siteUrl: form.siteUrl,
                defaultMetaTitle: form.defaultMetaTitle,
                defaultMetaDescription: form.defaultMetaDescription,
                defaultMetaKeywords: form.defaultMetaKeywordsText.split(",").map((value) => value.trim()).filter(Boolean),
                supportEmail: form.supportEmail,
                supportPhone: form.supportPhone,
                socialLinks: parseSocialLinks(form.socialLinksText),
              }),
            });
            const body = await response.json();
            setMessage(response.ok ? "Site settings saved." : body.error || "Failed to save settings.");
          })
        }
      >
        {isPending ? "Saving..." : "Save site settings"}
      </button>
      {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
    </div>
  );
}
