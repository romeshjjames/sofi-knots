import { createAuditLog, getAuditLogs } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ProductReview, ReviewDetail, ReviewStatus, ReviewSupportOption, ReviewSummary } from "@/types/reviews";

const seedReviews: ReviewDetail[] = [
  {
    id: "review-rainbow-bloom-1",
    customerName: "Ananya Kapoor",
    customerEmail: "ananya.kapoor@gmail.com",
    customerInitials: "AK",
    customerImageUrl: null,
    productId: "rainbow-bloom-macrame-sling-bag",
    productName: "Rainbow Bloom Macrame Sling Bag",
    productSlug: "rainbow-bloom-macrame-sling-bag",
    rating: 5,
    title: "Beautiful finishing and premium quality",
    message: "The color story is even richer in person and the weave feels incredibly polished. It looks premium and sits beautifully for day events.",
    reviewDate: "2026-03-20",
    status: "approved",
    featuredReview: true,
    homepageFeature: true,
    highlightedReview: true,
    updatedAt: "2026-03-20T10:30:00.000Z",
  },
  {
    id: "review-terracotta-cushion-1",
    customerName: "Rhea Menon",
    customerEmail: "rhea.menon@outlook.com",
    customerInitials: "RM",
    customerImageUrl: null,
    productId: "terracotta-cushion-cover",
    productName: "Terracotta Cushion Cover",
    productSlug: "terracotta-cushion-cover",
    rating: 4,
    title: "Lovely texture and handcrafted detail",
    message: "The detailing is gorgeous and the texture instantly made the room feel warmer. I would love one more size option.",
    reviewDate: "2026-03-19",
    status: "pending",
    featuredReview: false,
    homepageFeature: false,
    highlightedReview: false,
    updatedAt: "2026-03-19T08:15:00.000Z",
  },
  {
    id: "review-natural-wall-hanging-1",
    customerName: "Ishita Arora",
    customerEmail: "ishita.arora@gmail.com",
    customerInitials: "IA",
    customerImageUrl: null,
    productId: "natural-wall-hanging",
    productName: "Natural Wall Hanging",
    productSlug: "natural-wall-hanging",
    rating: 2,
    title: "Mostly about the courier delay",
    message: "The original feedback focused more on the shipping delay than the product itself, so we kept it out of the public product page.",
    reviewDate: "2026-03-12",
    status: "rejected",
    featuredReview: false,
    homepageFeature: false,
    highlightedReview: false,
    updatedAt: "2026-03-12T07:45:00.000Z",
  },
];

function fallbackInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "SK"
  );
}

function normalizeReviews(payload: unknown): ReviewDetail[] {
  if (!Array.isArray(payload)) return seedReviews;

  return payload
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const value = entry as Record<string, unknown>;
      if (
        typeof value.id !== "string" ||
        typeof value.customerName !== "string" ||
        typeof value.productId !== "string" ||
        typeof value.productName !== "string" ||
        typeof value.productSlug !== "string"
      ) {
        return null;
      }

      const status: ReviewStatus =
        value.status === "approved" || value.status === "rejected" ? value.status : "pending";

      return {
        id: value.id,
        customerName: value.customerName,
        customerEmail: typeof value.customerEmail === "string" ? value.customerEmail : "",
        customerInitials: typeof value.customerInitials === "string" && value.customerInitials ? value.customerInitials : fallbackInitials(value.customerName),
        customerImageUrl: typeof value.customerImageUrl === "string" ? value.customerImageUrl : null,
        productId: value.productId,
        productName: value.productName,
        productSlug: value.productSlug,
        rating:
          typeof value.rating === "number" && value.rating >= 1 && value.rating <= 5
            ? Math.round(value.rating)
            : 5,
        title: typeof value.title === "string" ? value.title : "",
        message: typeof value.message === "string" ? value.message : "",
        reviewDate: typeof value.reviewDate === "string" ? value.reviewDate : new Date().toISOString().slice(0, 10),
        status,
        featuredReview: value.featuredReview === true,
        homepageFeature: value.homepageFeature === true,
        highlightedReview: value.highlightedReview === true,
        updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
      } satisfies ReviewDetail;
    })
    .filter((entry): entry is ReviewDetail => Boolean(entry));
}

async function persistReviews(reviews: ReviewDetail[], actorUserId?: string | null) {
  await createAuditLog({
    actorUserId: actorUserId ?? null,
    entityType: "review_admin",
    entityId: "library",
    action: "reviews:update",
    payload: { reviews },
  });
}

async function getProductSupportMap() {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from("products").select("id, name, slug").order("name", { ascending: true });
  if (error) throw new Error(error.message);

  const products = (data ?? []).map((row) => ({
    id: row.id,
    label: row.name,
    slug: row.slug,
  })) satisfies ReviewSupportOption[];

  return new Map(products.map((product) => [product.id, product]));
}

export async function getReviewSupportData() {
  const productMap = await getProductSupportMap();
  return {
    products: Array.from(productMap.values()),
  };
}

export async function getReviews(): Promise<ReviewSummary[]> {
  const logs = await getAuditLogs("review_admin", "library");
  const latest = logs.find((entry) => entry.action === "reviews:update");
  const reviews = normalizeReviews(latest?.payload?.reviews);
  const productMap = await getProductSupportMap().catch(() => new Map<string, ReviewSupportOption>());

  return reviews.map((review) => {
    const linkedProduct = productMap.get(review.productId);
    return {
      ...review,
      productName: linkedProduct?.label ?? review.productName,
      productSlug: linkedProduct?.slug ?? review.productSlug,
    };
  });
}

export async function getReviewById(id: string): Promise<ReviewDetail | null> {
  const reviews = await getReviews();
  return reviews.find((review) => review.id === id) ?? null;
}

export async function createReview(input: ReviewDetail, actorUserId?: string | null) {
  const reviews = await getReviews();
  const next: ReviewDetail[] = [{ ...input, updatedAt: new Date().toISOString() }, ...reviews];
  await persistReviews(next, actorUserId);
}

export async function updateReview(id: string, input: ReviewDetail, actorUserId?: string | null) {
  const reviews = await getReviews();
  const next = reviews.map((review) => (review.id === id ? { ...input, id, updatedAt: new Date().toISOString() } : review));
  await persistReviews(next, actorUserId);
}

export async function deleteReview(id: string, actorUserId?: string | null) {
  const reviews = await getReviews();
  const next = reviews.filter((review) => review.id !== id);
  await persistReviews(next, actorUserId);
}

export async function getApprovedReviewsForProduct(input: { productId: string; productSlug: string }): Promise<ProductReview[]> {
  const reviews = await getReviews();
  return reviews
    .filter((review) => (review.productId === input.productId || review.productSlug === input.productSlug) && review.status === "approved")
    .sort((left, right) => {
      if (left.featuredReview !== right.featuredReview) return left.featuredReview ? -1 : 1;
      return new Date(right.reviewDate).getTime() - new Date(left.reviewDate).getTime();
    })
    .map((review) => ({
      id: review.id,
      customerName: review.customerName,
      customerInitials: review.customerInitials,
      customerImageUrl: review.customerImageUrl,
      rating: review.rating,
      title: review.title,
      message: review.message,
      reviewDate: review.reviewDate,
      featuredReview: review.featuredReview,
    }));
}
