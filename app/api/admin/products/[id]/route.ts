import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const updates = {
    name: body.name,
    slug: body.slug,
    category_id: body.categoryId ?? null,
    collection_id: body.collectionId ?? null,
    short_description: body.shortDescription || null,
    description: body.description || null,
    price_inr: body.priceInr,
    compare_at_price_inr: body.originalPriceInr || null,
    badge: body.badge || null,
    featured_image_url: body.featuredImageUrl || null,
    is_featured: Boolean(body.isFeatured),
    seo_title: body.seoTitle || body.name,
    seo_description: body.seoDescription || body.shortDescription || body.description || null,
    seo_keywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
    status: body.status || "active",
  };

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", params.id)
      .select("id, slug, name, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "archive";

  try {
    const supabase = createAdminSupabaseClient();

    if (mode === "delete") {
      const { error } = await supabase.from("products").delete().eq("id", params.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ deleted: true });
    }

    const { error } = await supabase.from("products").update({ status: "archived" }).eq("id", params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ archived: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to archive product." }, { status: 500 });
  }
}
