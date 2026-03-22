import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { buildCopyLabel, buildCopySku, buildCopySlug } from "@/lib/admin-clone";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const [{ data: source, error: sourceError }, { data: existingProducts, error: existingError }] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .maybeSingle(),
      supabase.from("products").select("name, slug"),
    ]);

    if (sourceError) return NextResponse.json({ error: sourceError.message }, { status: 500 });
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (!source) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const existingNames = new Set((existingProducts ?? []).map((item) => String(item.name).toLowerCase()));
    const existingSlugs = new Set((existingProducts ?? []).map((item) => String(item.slug).toLowerCase()));
    const nextName = buildCopyLabel(source.name, existingNames);
    const nextSlug = buildCopySlug(source.slug, existingSlugs);

    const { data: clone, error: cloneError } = await supabase
      .from("products")
      .insert({
        name: nextName,
        slug: nextSlug,
        sku: buildCopySku(source.sku, "copy"),
        category_id: source.category_id,
        collection_id: source.collection_id,
        short_description: source.short_description,
        description: source.description,
        price_inr: source.price_inr,
        compare_at_price_inr: source.compare_at_price_inr,
        featured_image_url: source.featured_image_url,
        badge: source.badge,
        rating: source.rating,
        status: "draft",
        is_featured: false,
        seo_title: source.seo_title ? `${source.seo_title} Copy` : `${nextName} | Sofi Knots`,
        seo_description: source.seo_description,
        seo_keywords: source.seo_keywords ?? [],
      })
      .select("id, name, slug")
      .single();

    if (cloneError) return NextResponse.json({ error: cloneError.message }, { status: 500 });

    const [
      { data: productSettings, error: settingsError },
      { data: productPageContent, error: pageError },
      { data: productImages, error: imagesError },
      { data: productVariants, error: variantsError },
    ] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("payload")
        .eq("entity_type", "product_admin")
        .eq("entity_id", params.id)
        .eq("action", "settings:update")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("audit_logs")
        .select("payload")
        .eq("entity_type", "product_page_content")
        .eq("entity_id", params.id)
        .eq("action", "content:update")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("product_images")
        .select("image_url, alt_text, sort_order")
        .eq("product_id", params.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_variants")
        .select("title, sku, price_inr, compare_at_price_inr, stock_quantity, attributes, is_default")
        .eq("product_id", params.id)
        .order("created_at", { ascending: true }),
    ]);

    if (settingsError || pageError || imagesError || variantsError) {
      return NextResponse.json(
        { error: settingsError?.message || pageError?.message || imagesError?.message || variantsError?.message || "Failed to load product clone data." },
        { status: 500 },
      );
    }

    const settingsPayload = (productSettings?.payload ?? {}) as Record<string, unknown>;
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "product_admin",
      entityId: clone.id,
      action: "settings:update",
      payload: {
        ...settingsPayload,
        inventoryQuantity: typeof settingsPayload.inventoryQuantity === "number" ? settingsPayload.inventoryQuantity : 0,
      },
    });

    const pageBody = (productPageContent?.payload as { body?: unknown[] } | null)?.body;
    if (Array.isArray(pageBody)) {
      await createAuditLog({
        actorUserId: auth.session.user.id,
        entityType: "product_page_content",
        entityId: clone.id,
        action: "content:update",
        payload: { body: pageBody },
      });
    }

    if ((productImages ?? []).length) {
      const { error } = await supabase.from("product_images").insert(
        productImages.map((image) => ({
          product_id: clone.id,
          image_url: image.image_url,
          alt_text: image.alt_text,
          sort_order: image.sort_order,
        })),
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if ((productVariants ?? []).length) {
      const { error } = await supabase.from("product_variants").insert(
        productVariants.map((variant, index) => ({
          product_id: clone.id,
          title: variant.title,
          sku: buildCopySku(variant.sku, `copy-${index + 1}`),
          price_inr: variant.price_inr,
          compare_at_price_inr: variant.compare_at_price_inr,
          stock_quantity: variant.stock_quantity,
          attributes: variant.attributes ?? {},
          is_default: variant.is_default,
        })),
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "product",
      entityId: clone.id,
      action: "clone",
      payload: { sourceId: params.id, sourceSlug: source.slug },
    });

    return NextResponse.json({ product: clone });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to clone product." }, { status: 500 });
  }
}
