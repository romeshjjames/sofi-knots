import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
}: MetadataInput): Metadata {
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const canonical = absoluteUrl(path);

  return {
    metadataBase: new URL(siteConfig.url),
    title: fullTitle,
    description,
    keywords: [...siteConfig.defaultKeywords, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  image: string;
  sku: string;
  price: number;
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
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: input.price,
      availability: "https://schema.org/InStock",
      url: siteConfig.url,
    },
  };
}
