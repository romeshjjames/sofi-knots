"use client";

import { useMemo, useState, useTransition } from "react";
import type { SiteSettingsRecord } from "@/lib/admin-data";

type Props = {
  settings: SiteSettingsRecord;
};

type SectionKey =
  | "store"
  | "branding"
  | "contact"
  | "social"
  | "shipping"
  | "payments"
  | "taxes"
  | "notifications"
  | "seo"
  | "policies"
  | "profile";

const sections: { key: SectionKey; label: string; description: string }[] = [
  { key: "store", label: "Store information", description: "Core business details and storefront identity." },
  { key: "branding", label: "Branding", description: "Logo, colors, fonts, and footer brand presentation." },
  { key: "contact", label: "Contact details", description: "Support, WhatsApp, and customer contact copy." },
  { key: "social", label: "Social links", description: "Instagram, Pinterest, WhatsApp, and other channels." },
  { key: "shipping", label: "Shipping", description: "Methods, delivery timing, free shipping, and packaging notes." },
  { key: "payments", label: "Payments", description: "Enabled payment methods and checkout instructions." },
  { key: "taxes", label: "Taxes", description: "Tax rate, inclusive pricing, and GST notes." },
  { key: "notifications", label: "Notifications", description: "Operational alerts and customer communication defaults." },
  { key: "seo", label: "SEO defaults", description: "Default metadata, homepage SEO, and indexing controls." },
  { key: "policies", label: "Policies", description: "Privacy, terms, shipping, and return policy content." },
  { key: "profile", label: "Admin profile", description: "Admin account details and password update." },
];

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function arrayToLines(values: string[]) {
  return values.join("\n");
}

function socialToText(value: Record<string, string>) {
  return Object.entries(value).map(([key, link]) => `${key}: ${link}`).join("\n");
}

function textToSocial(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) acc[key.trim()] = rest.join(":").trim();
    return acc;
  }, {});
}

function inputClassName() {
  return "brand-input";
}

export function SiteSettingsForm({ settings }: Props) {
  const initial = useMemo(
    () => ({
      ...settings,
      defaultMetaKeywordsText: settings.defaultMetaKeywords.join(", "),
      socialLinksText: socialToText(settings.socialLinks),
      shippingMethodsText: arrayToLines(settings.shipping.methods),
      shippingZonesText: arrayToLines(settings.shipping.shippingZones),
      enabledMethodsText: arrayToLines(settings.payments.enabledMethods),
      password: { currentPassword: "", newPassword: "", confirmPassword: "" },
    }),
    [settings],
  );

  const [activeSection, setActiveSection] = useState<SectionKey>("store");
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetChanges() {
    setForm(initial);
    setMessage("Unsaved changes were reset.");
  }

  function saveSettings() {
    setMessage(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/settings/site", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          defaultMetaKeywords: form.defaultMetaKeywordsText.split(",").map((item) => item.trim()).filter(Boolean),
          socialLinks: textToSocial(form.socialLinksText),
          shipping: {
            ...form.shipping,
            methods: splitLines(form.shippingMethodsText),
            shippingZones: splitLines(form.shippingZonesText),
          },
          payments: {
            ...form.payments,
            enabledMethods: splitLines(form.enabledMethodsText),
          },
        }),
      });
      const body = await response.json();
      setMessage(response.ok ? "Settings saved successfully." : body.error || "Failed to save settings.");
      if (response.ok) {
        setForm((current) => ({
          ...current,
          password: { currentPassword: "", newPassword: "", confirmPassword: "" },
        }));
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-4">
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${activeSection === section.key ? "border-[#d8c29c] bg-white shadow-sm" : "border-transparent bg-transparent hover:border-[#eceff3] hover:bg-white"}`}
            >
              <div className="text-sm font-medium text-slate-900">{section.label}</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">{section.description}</div>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">{sections.find((section) => section.key === activeSection)?.label}</p>
            <p className="text-sm text-slate-500">Changes are validated before saving. Reset discards unsaved edits in this session.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="brand-btn-outline px-4 py-2" onClick={resetChanges}>Reset</button>
            <button type="button" className="brand-btn-primary px-4 py-2" disabled={isPending} onClick={saveSettings}>
              {isPending ? "Saving..." : "Save settings"}
            </button>
          </div>
        </div>

        {activeSection === "store" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClassName()} value={form.siteName} onChange={(event) => setForm((current) => ({ ...current, siteName: event.target.value }))} placeholder="Store name" />
              <input className={inputClassName()} value={form.siteUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, siteUrl: event.target.value }))} placeholder="Store URL" />
              <input className={inputClassName()} value={form.supportEmail ?? ""} onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))} placeholder="Store email" />
              <input className={inputClassName()} value={form.supportPhone ?? ""} onChange={(event) => setForm((current) => ({ ...current, supportPhone: event.target.value }))} placeholder="Store phone" />
            </div>
            <textarea className="brand-input min-h-24" value={form.storeDescription ?? ""} onChange={(event) => setForm((current) => ({ ...current, storeDescription: event.target.value }))} placeholder="Store description" />
            <textarea className="brand-input min-h-24" value={form.businessAddress ?? ""} onChange={(event) => setForm((current) => ({ ...current, businessAddress: event.target.value }))} placeholder="Business address" />
            <input className={inputClassName()} value={form.businessHours ?? ""} onChange={(event) => setForm((current) => ({ ...current, businessHours: event.target.value }))} placeholder="Business hours" />
          </section>
        ) : null}

        {activeSection === "branding" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClassName()} value={form.branding.logoUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, logoUrl: event.target.value } }))} placeholder="Logo URL" />
              <input className={inputClassName()} value={form.branding.faviconUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, faviconUrl: event.target.value } }))} placeholder="Favicon URL" />
              <input className={inputClassName()} value={form.branding.primaryColor} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, primaryColor: event.target.value } }))} placeholder="Primary brand color" />
              <input className={inputClassName()} value={form.branding.accentColor} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, accentColor: event.target.value } }))} placeholder="Accent color" />
              <input className={inputClassName()} value={form.branding.fontHeading ?? ""} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, fontHeading: event.target.value } }))} placeholder="Heading font" />
              <input className={inputClassName()} value={form.branding.fontBody ?? ""} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, fontBody: event.target.value } }))} placeholder="Body font" />
            </div>
            <textarea className="brand-input min-h-24" value={form.branding.footerBrandText ?? ""} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, footerBrandText: event.target.value } }))} placeholder="Footer brand text" />
            <input className={inputClassName()} value={form.branding.defaultBannerImageUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, branding: { ...current.branding, defaultBannerImageUrl: event.target.value } }))} placeholder="Default banner image URL" />
          </section>
        ) : null}

        {activeSection === "contact" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClassName()} value={form.supportEmail ?? ""} onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))} placeholder="Contact email" />
              <input className={inputClassName()} value={form.supportPhone ?? ""} onChange={(event) => setForm((current) => ({ ...current, supportPhone: event.target.value }))} placeholder="Phone number" />
              <input className={inputClassName()} value={form.whatsappPhone ?? ""} onChange={(event) => setForm((current) => ({ ...current, whatsappPhone: event.target.value }))} placeholder="WhatsApp number" />
              <input className={inputClassName()} value={form.notifications.notificationEmail ?? ""} onChange={(event) => setForm((current) => ({ ...current, notifications: { ...current.notifications, notificationEmail: event.target.value } }))} placeholder="Notification email" />
            </div>
            <textarea className="brand-input min-h-28" value={form.contactPageMessage ?? ""} onChange={(event) => setForm((current) => ({ ...current, contactPageMessage: event.target.value }))} placeholder="Contact page message" />
          </section>
        ) : null}

        {activeSection === "social" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <textarea className="brand-input min-h-40" value={form.socialLinksText} onChange={(event) => setForm((current) => ({ ...current, socialLinksText: event.target.value }))} placeholder={"instagram: https://instagram.com/...\nfacebook: https://facebook.com/..."} />
          </section>
        ) : null}

        {activeSection === "shipping" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClassName()} type="number" value={form.shipping.shippingChargeInr} onChange={(event) => setForm((current) => ({ ...current, shipping: { ...current.shipping, shippingChargeInr: Number(event.target.value) || 0 } }))} placeholder="Shipping charge" />
              <input className={inputClassName()} type="number" value={form.shipping.freeShippingThresholdInr} onChange={(event) => setForm((current) => ({ ...current, shipping: { ...current.shipping, freeShippingThresholdInr: Number(event.target.value) || 0 } }))} placeholder="Free shipping threshold" />
            </div>
            <textarea className="brand-input min-h-24" value={form.shippingMethodsText} onChange={(event) => setForm((current) => ({ ...current, shippingMethodsText: event.target.value }))} placeholder={"Shipping methods\nStandard shipping\nExpress shipping"} />
            <input className={inputClassName()} value={form.shipping.deliveryTimeline ?? ""} onChange={(event) => setForm((current) => ({ ...current, shipping: { ...current.shipping, deliveryTimeline: event.target.value } }))} placeholder="Delivery timeline" />
            <textarea className="brand-input min-h-24" value={form.shippingZonesText} onChange={(event) => setForm((current) => ({ ...current, shippingZonesText: event.target.value }))} placeholder={"Shipping zones\nIndia\nInternational"} />
            <textarea className="brand-input min-h-24" value={form.shipping.packagingNotes ?? ""} onChange={(event) => setForm((current) => ({ ...current, shipping: { ...current.shipping, packagingNotes: event.target.value } }))} placeholder="Packaging notes" />
          </section>
        ) : null}

        {activeSection === "payments" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <textarea className="brand-input min-h-24" value={form.enabledMethodsText} onChange={(event) => setForm((current) => ({ ...current, enabledMethodsText: event.target.value }))} placeholder={"Enabled payment methods\nRazorpay\nUPI\nCards"} />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Cash on delivery", "codEnabled"],
                ["Card payments", "cardEnabled"],
                ["UPI", "upiEnabled"],
                ["Wallets", "walletEnabled"],
                ["Bank transfer", "bankTransferEnabled"],
              ].map(([label, key]) => (
                <label key={String(key)} className="flex items-center gap-3 rounded-2xl border border-[#eceff3] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form.payments[key as keyof typeof form.payments])}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        payments: { ...current.payments, [key]: event.target.checked },
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <textarea className="brand-input min-h-24" value={form.payments.paymentInstructions ?? ""} onChange={(event) => setForm((current) => ({ ...current, payments: { ...current.payments, paymentInstructions: event.target.value } }))} placeholder="Payment instructions" />
          </section>
        ) : null}

        {activeSection === "taxes" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClassName()} type="number" value={form.taxes.taxRate} onChange={(event) => setForm((current) => ({ ...current, taxes: { ...current.taxes, taxRate: Number(event.target.value) || 0 } }))} placeholder="Tax percentage" />
              <input className={inputClassName()} value={form.taxes.gstin ?? ""} onChange={(event) => setForm((current) => ({ ...current, taxes: { ...current.taxes, gstin: event.target.value } }))} placeholder="GST / VAT number" />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-[#eceff3] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={form.taxes.taxInclusive} onChange={(event) => setForm((current) => ({ ...current, taxes: { ...current.taxes, taxInclusive: event.target.checked } }))} />
              Tax-inclusive pricing
            </label>
            <textarea className="brand-input min-h-24" value={form.taxes.regionRules ?? ""} onChange={(event) => setForm((current) => ({ ...current, taxes: { ...current.taxes, regionRules: event.target.value } }))} placeholder="Region-based tax rules" />
          </section>
        ) : null}

        {activeSection === "notifications" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Admin order emails", "adminOrderEmails"],
                ["Customer confirmations", "customerOrderConfirmations"],
                ["Shipping notifications", "shippingNotifications"],
                ["Low stock alerts", "lowStockAlerts"],
                ["Contact inquiry alerts", "contactInquiryAlerts"],
                ["Custom order alerts", "customOrderAlerts"],
              ].map(([label, key]) => (
                <label key={String(key)} className="flex items-center gap-3 rounded-2xl border border-[#eceff3] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form.notifications[key as keyof typeof form.notifications])}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notifications: { ...current.notifications, [key]: event.target.checked },
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <input className={inputClassName()} value={form.notifications.notificationEmail ?? ""} onChange={(event) => setForm((current) => ({ ...current, notifications: { ...current.notifications, notificationEmail: event.target.value } }))} placeholder="Notification email" />
          </section>
        ) : null}

        {activeSection === "seo" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <input className={inputClassName()} value={form.defaultMetaTitle ?? ""} onChange={(event) => setForm((current) => ({ ...current, defaultMetaTitle: event.target.value }))} placeholder="Default meta title" />
            <textarea className="brand-input min-h-24" value={form.defaultMetaDescription ?? ""} onChange={(event) => setForm((current) => ({ ...current, defaultMetaDescription: event.target.value }))} placeholder="Default meta description" />
            <input className={inputClassName()} value={form.defaultMetaKeywordsText} onChange={(event) => setForm((current) => ({ ...current, defaultMetaKeywordsText: event.target.value }))} placeholder="Default meta keywords" />
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClassName()} value={form.seo.homepageTitle ?? ""} onChange={(event) => setForm((current) => ({ ...current, seo: { ...current.seo, homepageTitle: event.target.value } }))} placeholder="Homepage SEO title" />
              <input className={inputClassName()} value={form.seo.socialSharingImage ?? ""} onChange={(event) => setForm((current) => ({ ...current, seo: { ...current.seo, socialSharingImage: event.target.value } }))} placeholder="Social sharing image URL" />
            </div>
            <textarea className="brand-input min-h-24" value={form.seo.homepageDescription ?? ""} onChange={(event) => setForm((current) => ({ ...current, seo: { ...current.seo, homepageDescription: event.target.value } }))} placeholder="Homepage SEO description" />
            <label className="flex items-center gap-3 rounded-2xl border border-[#eceff3] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-700">
              <input type="checkbox" checked={form.seo.allowIndexing} onChange={(event) => setForm((current) => ({ ...current, seo: { ...current.seo, allowIndexing: event.target.checked } }))} />
              Allow search engine indexing
            </label>
          </section>
        ) : null}

        {activeSection === "policies" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <textarea className="brand-input min-h-32" value={form.policies.privacyPolicy ?? ""} onChange={(event) => setForm((current) => ({ ...current, policies: { ...current.policies, privacyPolicy: event.target.value } }))} placeholder="Privacy Policy" />
            <textarea className="brand-input min-h-32" value={form.policies.termsAndConditions ?? ""} onChange={(event) => setForm((current) => ({ ...current, policies: { ...current.policies, termsAndConditions: event.target.value } }))} placeholder="Terms & Conditions" />
            <textarea className="brand-input min-h-32" value={form.policies.shippingPolicy ?? ""} onChange={(event) => setForm((current) => ({ ...current, policies: { ...current.policies, shippingPolicy: event.target.value } }))} placeholder="Shipping Policy" />
            <textarea className="brand-input min-h-32" value={form.policies.returnRefundPolicy ?? ""} onChange={(event) => setForm((current) => ({ ...current, policies: { ...current.policies, returnRefundPolicy: event.target.value } }))} placeholder="Return / Refund Policy" />
          </section>
        ) : null}

        {activeSection === "profile" ? (
          <section className="grid gap-4 rounded-[24px] border border-[#e7eaee] bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClassName()} value={form.adminProfile.fullName ?? ""} onChange={(event) => setForm((current) => ({ ...current, adminProfile: { ...current.adminProfile, fullName: event.target.value } }))} placeholder="Admin name" />
              <input className={inputClassName()} value={form.adminProfile.email ?? ""} onChange={(event) => setForm((current) => ({ ...current, adminProfile: { ...current.adminProfile, email: event.target.value } }))} placeholder="Admin email" />
              <input className={inputClassName()} value={form.adminProfile.phone ?? ""} onChange={(event) => setForm((current) => ({ ...current, adminProfile: { ...current.adminProfile, phone: event.target.value } }))} placeholder="Admin phone" />
              <input className={inputClassName()} value={form.adminProfile.profileImageUrl ?? ""} onChange={(event) => setForm((current) => ({ ...current, adminProfile: { ...current.adminProfile, profileImageUrl: event.target.value } }))} placeholder="Profile image URL" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <input className={inputClassName()} type="password" value={form.password.currentPassword} onChange={(event) => setForm((current) => ({ ...current, password: { ...current.password, currentPassword: event.target.value } }))} placeholder="Current password" />
              <input className={inputClassName()} type="password" value={form.password.newPassword} onChange={(event) => setForm((current) => ({ ...current, password: { ...current.password, newPassword: event.target.value } }))} placeholder="New password" />
              <input className={inputClassName()} type="password" value={form.password.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, password: { ...current.password, confirmPassword: event.target.value } }))} placeholder="Confirm new password" />
            </div>
          </section>
        ) : null}

        {message ? <p className="text-sm text-brand-warm">{message}</p> : null}
      </div>
    </div>
  );
}
