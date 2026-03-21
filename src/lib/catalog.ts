import { blogPosts as fallbackBlogPosts } from "@/data/blog";
import {
  getFeaturedProducts as getFallbackFeaturedProducts,
  getNewArrivalProducts as getFallbackNewArrivalProducts,
  getProductBySlug as getFallbackProductBySlug,
  products as fallbackProducts,
  storefrontCollections as fallbackCollections,
} from "@/data/products";
import productBag from "@/assets/product-bag.jpeg";
import productPillow from "@/assets/product-pillow.jpeg";
import { getFeaturedProductMerchandising } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { BlogPost, Collection, Product } from "@/types/commerce";

type CatalogResult<T> = {
  data: T;
  source: "supabase" | "fallback";
  error?: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductRow = {
  id: string;
  category_id: string | null;
  collection_id: string | null;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price_inr: number;
  compare_at_price_inr: number | null;
  featured_image_url: string | null;
  badge: string | null;
  rating: number | null;
  is_featured?: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  status: "draft" | "active" | "archived";
  categories?: { name: string; slug: string }[] | null;
  collections?: { name: string; slug: string }[] | null;
};

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
};

function mapProductRow(row: ProductRow): Product | null {
  const fallback = fallbackProducts.find((item) => item.slug === row.slug || item.name === row.name);
  const category = row.categories?.[0];
  const collection = row.collections?.[0];
  const fallbackLike = fallback ?? {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price_inr,
    originalPrice: row.compare_at_price_inr ?? undefined,
    image: productBag,
    category: category?.name ?? "Accessories",
    categorySlug: category?.slug ?? "accessories",
    collection: collection?.name ?? "Everyday Essentials",
    collectionSlug: collection?.slug ?? "everyday-essentials",
    badge: row.badge ?? undefined,
    description: row.description ?? row.short_description ?? "Handcrafted macrame product by Sofi Knots.",
    shortDescription: row.short_description ?? "Handcrafted macrame product.",
    rating: row.rating ?? 5,
    seoTitle: row.seo_title ?? `${row.name} | Sofi Knots`,
    seoDescription: row.seo_description ?? row.short_description ?? `Shop ${row.name} by Sofi Knots.`,
    seoKeywords: row.seo_keywords?.length ? row.seo_keywords : ["handmade macrame", "sofi knots"],
  };

  return {
    ...fallbackLike,
    id: row.id,
    categoryId: row.category_id,
    collectionId: row.collection_id,
    slug: row.slug,
    name: row.name,
    price: row.price_inr,
    originalPrice: row.compare_at_price_inr ?? undefined,
    featuredImageUrl: row.featured_image_url,
    badge: row.badge ?? fallbackLike.badge,
    rating: row.rating ?? fallbackLike.rating,
    isFeatured: row.is_featured ?? false,
    shortDescription: row.short_description ?? fallbackLike.shortDescription,
    description: row.description ?? fallbackLike.description,
    category: category?.name ?? fallbackLike.category,
    categorySlug: category?.slug ?? fallbackLike.categorySlug,
    collection: collection?.name ?? fallbackLike.collection,
    collectionSlug: collection?.slug ?? fallbackLike.collectionSlug,
    seoTitle: row.seo_title ?? fallbackLike.seoTitle,
    seoDescription: row.seo_description ?? fallbackLike.seoDescription,
    seoKeywords: row.seo_keywords?.length ? row.seo_keywords : fallbackLike.seoKeywords,
    status: row.status,
  };
}

function mapCollectionRow(row: CollectionRow): Collection | null {
  const fallback = fallbackCollections.find((item) => item.slug === row.slug || item.title === row.name);
  const fallbackLike = fallback ?? {
    id: row.id,
    title: row.name,
    slug: row.slug,
    description: row.description ?? "Handcrafted collection by Sofi Knots.",
    image: productPillow,
    seoTitle: row.seo_title ?? `${row.name} | Sofi Knots`,
    seoDescription: row.seo_description ?? row.description ?? `Explore ${row.name} by Sofi Knots.`,
    seoKeywords: row.seo_keywords?.length ? row.seo_keywords : ["handmade macrame", "sofi knots collection"],
  };

  return {
    ...fallbackLike,
    id: row.id,
    title: row.name,
    slug: row.slug,
    description: row.description ?? fallbackLike.description,
    imageUrl: row.image_url,
    seoTitle: row.seo_title ?? fallbackLike.seoTitle,
    seoDescription: row.seo_description ?? fallbackLike.seoDescription,
    seoKeywords: row.seo_keywords?.length ? row.seo_keywords : fallbackLike.seoKeywords,
  };
}

async function fetchProductsFromSupabase() {
  const supabase = createAdminSupabaseClient();

  return supabase
    .from("products")
    .select(
      `
        id,
        category_id,
        collection_id,
        slug,
        name,
        short_description,
        description,
        price_inr,
        compare_at_price_inr,
        featured_image_url,
        badge,
        rating,
        is_featured,
        seo_title,
        seo_description,
        seo_keywords,
        status,
        categories(name, slug),
        collections(name, slug)
      `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });
}

export async function getCatalogProducts(): Promise<CatalogResult<Product[]>> {
  try {
    const { data, error } = await fetchProductsFromSupabase();

    if (error) {
      return { data: fallbackProducts, source: "fallback", error: error.message };
    }

    const mapped = (data as ProductRow[]).map(mapProductRow) as Product[];
    if (!mapped.length) {
      return { data: fallbackProducts, source: "fallback", error: "No products found in Supabase yet." };
    }

    return { data: mapped, source: "supabase" };
  } catch (error) {
    return {
      data: fallbackProducts,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown catalog error",
    };
  }
}

export async function getFeaturedProducts(): Promise<CatalogResult<Product[]>> {
  const result = await getCatalogProducts();
  if (result.source === "supabase") {
    const merchandising = await getFeaturedProductMerchandising().catch(() => ({ productIds: [], updatedAt: null }));
    const orderMap = new Map<string, number>(merchandising.productIds.map((id, index): [string, number] => [id, index]));
    const featuredProducts = result.data.filter((product) => product.isFeatured);
    const rankedFeaturedProducts = [...featuredProducts].sort((left, right) => {
      const leftIndex = orderMap.get(left.id);
      const rightIndex = orderMap.get(right.id);

      if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
      if (leftIndex !== undefined) return -1;
      if (rightIndex !== undefined) return 1;
      return right.rating - left.rating;
    });

    return {
      ...result,
      data: (rankedFeaturedProducts.length ? rankedFeaturedProducts : result.data.filter((product) => product.badge === "Bestseller" || product.rating >= 4.8)).slice(0, 4),
    };
  }

  return { ...result, data: getFallbackFeaturedProducts() };
}

export async function getNewArrivalProducts(): Promise<CatalogResult<Product[]>> {
  const result = await getCatalogProducts();
  if (result.source === "supabase") {
    return {
      ...result,
      data: result.data.filter((product) => product.badge === "New").concat(result.data.slice(0, 4)).slice(0, 4),
    };
  }

  return { ...result, data: getFallbackNewArrivalProducts() };
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogResult<Product | null>> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        `
          id,
          category_id,
          collection_id,
          slug,
          name,
          short_description,
          description,
          price_inr,
          compare_at_price_inr,
          featured_image_url,
          badge,
          rating,
          is_featured,
          seo_title,
          seo_description,
          seo_keywords,
          status
        `,
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data) {
      return {
        data: getFallbackProductBySlug(slug) ?? null,
        source: "fallback",
        error: error?.message ?? "Product not found in Supabase",
      };
    }

    const row = data as ProductRow;
    const productWithRelations: ProductRow = { ...row, categories: null, collections: null };

    if (row.category_id) {
      const { data: category } = await supabase
        .from("categories")
        .select("name, slug")
        .eq("id", row.category_id)
        .maybeSingle();
      productWithRelations.categories = category ? [category] : null;
    }

    if (row.collection_id) {
      const { data: collection } = await supabase
        .from("collections")
        .select("name, slug")
        .eq("id", row.collection_id)
        .maybeSingle();
      productWithRelations.collections = collection ? [collection] : null;
    }

    return { data: mapProductRow(productWithRelations), source: "supabase" };
  } catch (error) {
    return {
      data: getFallbackProductBySlug(slug) ?? null,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown product lookup error",
    };
  }
}

export async function getCatalogCollections(): Promise<CatalogResult<Collection[]>> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("collections")
      .select("id, name, slug, description, image_url, seo_title, seo_description, seo_keywords")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return { data: fallbackCollections, source: "fallback", error: error.message };
    }

    const mapped = (data as CollectionRow[]).map(mapCollectionRow) as Collection[];
    if (!mapped.length) {
      return { data: fallbackCollections, source: "fallback", error: "No collections found in Supabase yet." };
    }

    return { data: mapped, source: "supabase" };
  } catch (error) {
    return {
      data: fallbackCollections,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown collection error",
    };
  }
}

export async function getCatalogCategories(): Promise<CatalogResult<Category[]>> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return {
        data: Array.from(new Map(fallbackProducts.map((product) => [product.categorySlug, { id: product.categorySlug, name: product.category, slug: product.categorySlug }])).values()),
        source: "fallback",
        error: error.message,
      };
    }

    return { data: (data ?? []) as Category[], source: "supabase" };
  } catch (error) {
    return {
      data: Array.from(new Map(fallbackProducts.map((product) => [product.categorySlug, { id: product.categorySlug, name: product.category, slug: product.categorySlug }])).values()),
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown category error",
    };
  }
}

export async function getCatalogBlogPosts(): Promise<CatalogResult<BlogPost[]>> {
  return { data: fallbackBlogPosts, source: "fallback", error: "Blog is still using starter content until CMS tables are populated." };
}
