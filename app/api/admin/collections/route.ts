import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (!body.name || !body.slug) {
    return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("collections")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image_url: body.imageUrl || null,
        seo_title: body.seoTitle || body.name,
        seo_description: body.seoDescription || body.description || null,
        seo_keywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
        sort_order: body.sortOrder || 0,
      })
      .select("id, name, slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (Array.isArray(body.assignedProductIds)) {
      const assignedProductIds = body.assignedProductIds.filter((value: unknown): value is string => typeof value === "string");
      if (assignedProductIds.length) {
        await supabase.from("products").update({ collection_id: data.id }).in("id", assignedProductIds);
      }
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "collection_admin",
      entityId: data.id,
      action: "settings:update",
      payload: {
        collectionType: body.collectionType || "manual",
        status: body.status || "active",
        visibility: body.visibility || "visible",
        onlineStoreEnabled: body.onlineStoreEnabled !== false,
        salesChannels: Array.isArray(body.salesChannels) ? body.salesChannels : ["online-store"],
        assignedProductIds: Array.isArray(body.assignedProductIds) ? body.assignedProductIds : [],
        sortProducts: body.sortProducts || "manual",
        conditions: Array.isArray(body.conditions) ? body.conditions : [],
      },
    });

    return NextResponse.json({ collection: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create collection." }, { status: 500 });
  }
}
