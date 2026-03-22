import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createReview, getReviewById } from "@/lib/reviews";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const source = await getReviewById(params.id);
    if (!source) return NextResponse.json({ error: "Review not found." }, { status: 404 });

    const clone = {
      ...source,
      id: `review-${randomUUID()}`,
      title: `${source.title} Copy`,
      status: "pending" as const,
      featuredReview: false,
      homepageFeature: false,
      highlightedReview: false,
      updatedAt: null,
    };

    await createReview(clone, auth.session.user.id);
    return NextResponse.json({ review: { id: clone.id, customerName: clone.customerName, productSlug: clone.productSlug } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to clone review." }, { status: 500 });
  }
}
