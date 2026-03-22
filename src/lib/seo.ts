import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { getStorefrontSettings } from "@/lib/storefront";

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
};

type SeoConfig = {
  siteName: string;
  siteUrl: string;
  defaultKeywords: string[];
  socialSharingImage?: string | null;
  faviconUrl?: string | null;
};

function buildSeoConfig(overrides?: Partial<SeoConfig>): SeoConfig {
  return {
    siteName: overrides?.siteName || siteConfig.name,
    siteUrl: overrides?.siteUrl || siteConfig.url,
    defaultKeywords: overrides?.defaultKeywords || siteConfig.defaultKeywords,
    socialSharingImage: overrides?.socialSharingImage,
    faviconUrl: overrides?.faviconUrl,
  };
}

export function absoluteUrl(path = "/", baseUrl = siteConfig.url) {
  return new URL(path, baseUrl).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: MetadataInput, configOverrides?: Partial<SeoConfig>): Metadata {
  const config = buildSeoConfig(configOverrides);
  const fullTitle = title.includes(config.siteName) ? title : `${title} | ${config.siteName}`;
  const canonical = absoluteUrl(path, config.siteUrl);
  const openGraphImages = config.socialSharingImage ? [{ url: absoluteUrl(config.socialSharingImage, config.siteUrl) }] : undefined;
  const icons = config.faviconUrl ? { icon: absoluteUrl(config.faviconUrl, config.siteUrl) } : undefined;

  return {
    metadataBase: new URL(config.siteUrl),
    title: fullTitle,
    description,
    keywords: [...config.defaultKeywords, ...keywords],
    alternates: {
      canonical,
    },
    icons,
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: config.siteName,
      locale: "en_IN",
      type: "website",
      images: openGraphImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: openGraphImages?.map((image) => image.url),
    },
  };
}

export async function buildStorefrontMetadata(input: MetadataInput): Promise<Metadata> {
  const storefront = await getStorefrontSettings();

  return buildMetadata(input, {
    siteName: storefront.siteName,
    siteUrl: storefront.siteUrl,
    defaultKeywords: storefront.defaultKeywords,
    socialSharingImage: storefront.socialSharingImage,
    faviconUrl: storefront.faviconUrl,
  });
}

export function productJsonLd(input: {
  name: string;
  description: string;
  image: string;
  sku: string;
  price: number;
  brandName?: string;
  siteUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: [input.image],
    sku: input.sku,
    brand: {
      "@type": "Brand",
      name: input.brandName || siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: input.price,
      availability: "https://schema.org/InStock",
      url: input.siteUrl || siteConfig.url,
    },
  };
}
