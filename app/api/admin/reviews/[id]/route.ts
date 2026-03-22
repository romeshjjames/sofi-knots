import { NextResponse } from "next/server";
import { deleteReview, updateReview } from "@/lib/reviews";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    await updateReview(
      params.id,
      {
        id: params.id,
        customerName: body.customerName || "",
        customerEmail: body.customerEmail || "",
        customerInitials: body.customerInitials || "",
        customerImageUrl: body.customerImageUrl || null,
        productId: body.productId || "",
        productName: body.productName || "",
        productSlug: body.productSlug || "",
        rating: typeof body.rating === "number" ? body.rating : 5,
        title: body.title || "",
        message: body.message || "",
        reviewDate: body.reviewDate || new Date().toISOString().slice(0, 10),
        status: body.status === "approved" || body.status === "rejected" ? body.status : "pending",
        featuredReview: body.featuredReview === true,
        homepageFeature: body.homepageFeature === true,
        highlightedReview: body.highlightedReview === true,
        updatedAt: body.updatedAt || null,
      },
      auth.session.user.id,
    );

    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update review." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await deleteReview(params.id, auth.session.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete review." }, { status: 500 });
  }
}
