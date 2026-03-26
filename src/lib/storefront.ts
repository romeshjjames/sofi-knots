import { unstable_noStore as noStore } from "next/cache";
import { getSiteSettings } from "@/lib/admin-data";
import { getActiveAnnouncementBar, type AnnouncementBarRecord } from "@/lib/announcement-bar";
import { siteConfig } from "@/lib/site-config";

export type StorefrontSettings = {
  siteName: string;
  logoUrl: string | null;
  siteUrl: string;
  storeDescription: string;
  defaultKeywords: string[];
  socialSharingImage: string | null;
  faviconUrl: string | null;
  supportEmail: string;
  supportPhone: string;
  whatsappLink: string;
  contactMessage: string;
  footerBrandText: string;
  socialLinks: Record<string, string>;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    allowIndexing: boolean;
  };
  policies: {
    privacyPolicy: string | null;
    termsAndConditions: string | null;
    shippingPolicy: string | null;
    returnRefundPolicy: string | null;
  };
  shipping: {
    deliveryTimeline: string | null;
    freeShippingThresholdInr: number;
    shippingChargeInr: number;
    packagingNotes: string | null;
  };
  announcementBar: AnnouncementBarRecord | null;
};

function normalizeWhatsAppLink(inputPhone: string | null, socialLinks: Record<string, string>) {
  if (socialLinks.whatsapp) return socialLinks.whatsapp;
  if (!inputPhone) return siteConfig.social.whatsapp;
  const digits = inputPhone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : siteConfig.social.whatsapp;
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  noStore();
  const settings = await getSiteSettings();
  const siteUrl = settings.siteUrl || siteConfig.url;
  const supportEmail = settings.supportEmail || siteConfig.contactEmail;
  const supportPhone = settings.supportPhone || siteConfig.contactPhone;
  const socialLinks = {
    instagram: siteConfig.social.instagram,
    facebook: siteConfig.social.facebook,
    whatsapp: normalizeWhatsAppLink(settings.whatsappPhone, settings.socialLinks),
    ...settings.socialLinks,
  };

  return {
    siteName: settings.siteName || siteConfig.name,
    logoUrl: settings.branding.logoUrl,
    siteUrl,
    storeDescription: settings.storeDescription || siteConfig.description,
    defaultKeywords: settings.defaultMetaKeywords?.length ? settings.defaultMetaKeywords : siteConfig.defaultKeywords,
    socialSharingImage: settings.seo.socialSharingImage || settings.branding.defaultBannerImageUrl,
    faviconUrl: settings.branding.faviconUrl,
    supportEmail,
    supportPhone,
    whatsappLink: normalizeWhatsAppLink(settings.whatsappPhone, socialLinks),
    contactMessage:
      settings.contactPageMessage ||
      "We usually reply within 24 hours for product questions, gifting requests, and custom order inquiries.",
    footerBrandText:
      settings.branding.footerBrandText ||
      "Handcrafted macrame art made with love, patience, and premium natural materials.",
    socialLinks,
    seo: {
      defaultTitle: settings.defaultMetaTitle || siteConfig.defaultTitle,
      defaultDescription: settings.defaultMetaDescription || settings.storeDescription || siteConfig.description,
      allowIndexing: settings.seo.allowIndexing,
    },
    policies: settings.policies,
    shipping: settings.shipping,
    announcementBar: await getActiveAnnouncementBar(),
  };
}
