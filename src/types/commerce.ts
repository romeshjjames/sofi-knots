import type { StaticImageData } from "next/image";

export type SeoEntity = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
};

export type Product = SeoEntity & {
  id: string;
  categoryId?: string | null;
  collectionId?: string | null;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: StaticImageData;
  featuredImageUrl?: string | null;
  category: string;
  categorySlug: string;
  collection: string;
  collectionSlug: string;
  badge?: string;
  description: string;
  shortDescription: string;
  rating: number;
  isFeatured?: boolean;
  status?: "draft" | "active" | "archived";
};

export type Collection = SeoEntity & {
  id?: string;
  title: string;
  slug: string;
  description: string;
  image: StaticImageData;
  imageUrl?: string | null;
  sortOrder?: number;
};

export type BlogPost = SeoEntity & {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  authorName?: string | null;
  coverImageUrl?: string | null;
  body?: unknown;
  readTime: string;
  category: string;
};

export type CmsPage = SeoEntity & {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: unknown;
  canonicalUrl?: string | null;
};
