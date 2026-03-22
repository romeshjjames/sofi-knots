import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
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
        sku: body.sku || null,
        category_id: body.categoryId,
        collection_id: body.collectionId,
        short_description: body.shortDescription || null,
        description: body.description || null,
        price_inr: body.priceInr,
        compare_at_price_inr: body.originalPriceInr || null,
        badge: body.badge || null,
        featured_image_url: body.featuredImageUrl || null,
        is_featured: Boolean(body.isFeatured),
        status: body.status || "draft",
        seo_title: body.seoTitle || body.name,
        seo_description: body.seoDescription || body.shortDescription || body.description || `Shop ${body.name} from Sofi Knots.`,
        seo_keywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
      })
      .select("id, slug, name")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "product_admin",
      entityId: data.id,
      action: "settings:update",
      payload: {
        vendor: body.vendor || "Sofi Knots",
        tags: Array.isArray(body.tags) ? body.tags : [],
        costPerItem: typeof body.costPerItem === "number" ? body.costPerItem : null,
        barcode: body.barcode || null,
        inventoryQuantity: typeof body.inventoryQuantity === "number" ? body.inventoryQuantity : 0,
        inventoryTracking: body.inventoryTracking !== false,
        continueSellingWhenOutOfStock: body.continueSellingWhenOutOfStock === true,
        physicalProduct: body.physicalProduct !== false,
        weight: typeof body.weight === "number" ? body.weight : null,
        salesChannels: Array.isArray(body.salesChannels) ? body.salesChannels : ["online-store"],
      },
    });

    if (Array.isArray(body.pageBody)) {
      await createAuditLog({
        actorUserId: auth.session.user.id,
        entityType: "product_page_content",
        entityId: data.id,
        action: "content:update",
        payload: {
          body: body.pageBody,
        },
      });
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product." },
      { status: 500 },
    );
  }
}
