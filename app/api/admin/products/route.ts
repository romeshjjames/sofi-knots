import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (!body.name || !body.slug || !body.priceInr) {
    return NextResponse.json({ error: "Name, slug, and price are required." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        slug: body.slug,
        category_id: body.categoryId,
        collection_id: body.collectionId,
        short_description: body.shortDescription || null,
        description: body.description || null,
        price_inr: body.priceInr,
        compare_at_price_inr: body.originalPriceInr || null,
        badge: body.badge || null,
        featured_image_url: body.featuredImageUrl || null,
        is_featured: Boolean(body.isFeatured),
        status: "active",
        seo_title: body.seoTitle || body.name,
        seo_description: body.seoDescription || body.shortDescription || body.description || `Shop ${body.name} from Sofi Knots.`,
        seo_keywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
      })
      .select("id, slug, name")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product." },
      { status: 500 },
    );
  }
}
