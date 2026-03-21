import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { AdminRole } from "@/lib/supabase/auth";

export type ProductImageRecord = {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};

export type ProductVariantRecord = {
  id: string;
  productId: string;
  title: string;
  sku: string | null;
  priceInr: number;
  compareAtPriceInr: number | null;
  stockQuantity: number;
  attributes: Record<string, string>;
  isDefault: boolean;
};

export type PageRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: unknown;
  status: "draft" | "published";
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  canonicalUrl: string | null;
  updatedAt: string;
};

export type BlogPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: unknown;
  coverImageUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  status: "draft" | "published";
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string[];
  canonicalUrl: string | null;
  updatedAt: string;
};

export type StaffMemberRecord = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  roles: AdminRole[];
};

export type SiteSettingsRecord = {
  id: string | null;
  siteName: string;
  siteUrl: string | null;
  defaultMetaTitle: string | null;
  defaultMetaDescription: string | null;
  defaultMetaKeywords: string[];
  supportEmail: string | null;
  supportPhone: string | null;
  socialLinks: Record<string, string>;
};

export type AuditLogRecord = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type FeaturedMerchandisingRecord = {
  productIds: string[];
  updatedAt: string | null;
};

export type CollectionMerchandisingRecord = {
  collectionIds: string[];
  updatedAt: string | null;
};

export type HomepageSectionKey =
  | "hero"
  | "intro"
  | "collections"
  | "featured-products"
  | "new-arrivals"
  | "value-props"
  | "testimonials"
  | "newsletter";

export type HomepageSectionRecord = {
  key: HomepageSectionKey;
  label: string;
  description: string;
};

export type HomepageMerchandisingRecord = {
  sectionOrder: HomepageSectionKey[];
  updatedAt: string | null;
};

export type SavedViewRecord = {
  id: string;
  name: string;
  query: string;
  statusFilter: "all" | "active" | "draft" | "archived";
  presetView: "all" | "draft" | "active" | "needs-image" | "featured";
};

export type SavedViewsState = {
  views: SavedViewRecord[];
  activeViewId: string | null;
  updatedAt: string | null;
};

export const defaultHomepageSections: HomepageSectionRecord[] = [
  { key: "hero", label: "Hero", description: "Primary brand statement, CTA, and first-fold imagery." },
  { key: "intro", label: "Welcome intro", description: "Short founder-style introduction to the craft and brand story." },
  { key: "collections", label: "Collections grid", description: "Merchandising-focused collection cards used for discovery and SEO landings." },
  { key: "featured-products", label: "Featured products", description: "Bestsellers or campaign products highlighted in the featured lineup." },
  { key: "new-arrivals", label: "New arrivals", description: "Latest launches and recently published products." },
  { key: "value-props", label: "Why Sofi Knots", description: "Trust-building feature grid for craft, quality, and delivery." },
  { key: "testimonials", label: "Testimonials", description: "Customer proof and social trust content." },
  { key: "newsletter", label: "Newsletter signup", description: "Email capture and retention CTA near the bottom of the homepage." },
];

export async function getProductImages(productId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("id, product_id, image_url, alt_text, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map(
    (row) =>
      ({
        id: row.id,
        productId: row.product_id,
        imageUrl: row.image_url,
        altText: row.alt_text,
        sortOrder: row.sort_order,
      }) satisfies ProductImageRecord,
  );
}

export async function getProductVariants(productId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, product_id, title, sku, price_inr, compare_at_price_inr, stock_quantity, attributes, is_default")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map(
    (row) =>
      ({
        id: row.id,
        productId: row.product_id,
        title: row.title,
        sku: row.sku,
        priceInr: row.price_inr,
        compareAtPriceInr: row.compare_at_price_inr,
        stockQuantity: row.stock_quantity,
        attributes: (row.attributes ?? {}) as Record<string, string>,
        isDefault: row.is_default,
      }) satisfies ProductVariantRecord,
  );
}

export async function getPages() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("pages")
    .select("id, title, slug, excerpt, body, status, seo_title, seo_description, seo_keywords, canonical_url, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(
    (row) =>
      ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        body: row.body,
        status: row.status,
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        seoKeywords: row.seo_keywords ?? [],
        canonicalUrl: row.canonical_url,
        updatedAt: row.updated_at,
      }) satisfies PageRecord,
  );
}

export async function getBlogPosts() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, body, cover_image_url, author_name, published_at, status, seo_title, seo_description, seo_keywords, canonical_url, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(
    (row) =>
      ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        body: row.body,
        coverImageUrl: row.cover_image_url,
        authorName: row.author_name,
        publishedAt: row.published_at,
        status: row.status,
        seoTitle: row.seo_title,
        seoDescription: row.seo_description,
        seoKeywords: row.seo_keywords ?? [],
        canonicalUrl: row.canonical_url,
        updatedAt: row.updated_at,
      }) satisfies BlogPostRecord,
  );
}

export async function getStaffMembers() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, avatar_url, admin_roles(role)");
  if (error) throw new Error(error.message);
  return (data ?? []).map(
    (row) =>
      ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        roles: (row.admin_roles ?? []).map((role) => role.role as AdminRole),
      }) satisfies StaffMemberRecord,
  );
}

export async function getSiteSettings() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("id, site_name, site_url, default_meta_title, default_meta_description, default_meta_keywords, support_email, support_phone, social_links")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    return {
      id: null,
      siteName: "Sofi Knots",
      siteUrl: null,
      defaultMetaTitle: null,
      defaultMetaDescription: null,
      defaultMetaKeywords: [],
      supportEmail: null,
      supportPhone: null,
      socialLinks: {},
    } satisfies SiteSettingsRecord;
  }
  return {
    id: data.id,
    siteName: data.site_name,
    siteUrl: data.site_url,
    defaultMetaTitle: data.default_meta_title,
    defaultMetaDescription: data.default_meta_description,
    defaultMetaKeywords: data.default_meta_keywords ?? [],
    supportEmail: data.support_email,
    supportPhone: data.support_phone,
    socialLinks: (data.social_links ?? {}) as Record<string, string>,
  } satisfies SiteSettingsRecord;
}

export async function getAuditLogs(entityType?: string, entityId?: string) {
  const supabase = createAdminSupabaseClient();
  let query = supabase.from("audit_logs").select("id, entity_type, entity_id, action, payload, created_at").order("created_at", { ascending: false }).limit(30);
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(
    (row) =>
      ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        action: row.action,
        payload: (row.payload ?? {}) as Record<string, unknown>,
        createdAt: row.created_at,
      }) satisfies AuditLogRecord,
  );
}

export async function createAuditLog(input: {
  actorUserId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  payload?: Record<string, unknown>;
}) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: input.actorUserId ?? null,
    entity_type: input.entityType,
    entity_id: input.entityId,
    action: input.action,
    payload: input.payload ?? {},
  });
  if (error) throw new Error(error.message);
}

export async function getFeaturedProductMerchandising() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("payload, created_at")
    .eq("entity_type", "merchandising")
    .eq("entity_id", "featured_products")
    .eq("action", "featured:reorder")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const productIds = Array.isArray(payload.productIds) ? payload.productIds.filter((value): value is string => typeof value === "string") : [];

  return {
    productIds,
    updatedAt: data?.created_at ?? null,
  } satisfies FeaturedMerchandisingRecord;
}

export async function getCollectionMerchandising() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("payload, created_at")
    .eq("entity_type", "merchandising")
    .eq("entity_id", "homepage_collections")
    .eq("action", "collections:reorder")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const collectionIds = Array.isArray(payload.collectionIds) ? payload.collectionIds.filter((value): value is string => typeof value === "string") : [];

  return {
    collectionIds,
    updatedAt: data?.created_at ?? null,
  } satisfies CollectionMerchandisingRecord;
}

export async function getHomepageMerchandising() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("payload, created_at")
    .eq("entity_type", "merchandising")
    .eq("entity_id", "homepage_sections")
    .eq("action", "sections:reorder")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const sectionOrder = Array.isArray(payload.sectionOrder)
    ? payload.sectionOrder.filter((value): value is HomepageSectionKey =>
        typeof value === "string" && defaultHomepageSections.some((section) => section.key === value),
      )
    : [];

  return {
    sectionOrder,
    updatedAt: data?.created_at ?? null,
  } satisfies HomepageMerchandisingRecord;
}

export async function getSavedViews(userId: string, scope: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("payload, created_at")
    .eq("entity_type", "admin_preferences")
    .eq("entity_id", `${userId}:${scope}`)
    .eq("action", "saved_views:update")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const payload = (data?.payload ?? {}) as Record<string, unknown>;
  const views = Array.isArray(payload.views)
    ? payload.views
        .map((value) => {
          if (!value || typeof value !== "object") return null;
          const entry = value as Record<string, unknown>;
          if (typeof entry.id !== "string" || typeof entry.name !== "string") return null;
          return {
            id: entry.id,
            name: entry.name,
            query: typeof entry.query === "string" ? entry.query : "",
            statusFilter:
              entry.statusFilter === "active" || entry.statusFilter === "draft" || entry.statusFilter === "archived"
                ? entry.statusFilter
                : "all",
            presetView:
              entry.presetView === "draft" ||
              entry.presetView === "active" ||
              entry.presetView === "needs-image" ||
              entry.presetView === "featured"
                ? entry.presetView
                : "all",
          } satisfies SavedViewRecord;
        })
        .filter((value): value is SavedViewRecord => Boolean(value))
    : [];

  return {
    views,
    activeViewId: typeof payload.activeViewId === "string" ? payload.activeViewId : null,
    updatedAt: data?.created_at ?? null,
  } satisfies SavedViewsState;
}
