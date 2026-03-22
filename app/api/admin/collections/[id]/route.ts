import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    const supabase = createAdminSupabaseClient();
    const updates: Record<string, unknown> = {
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      image_url: body.imageUrl || null,
      seo_title: body.seoTitle || body.name,
      seo_description: body.seoDescription || body.description || null,
      seo_keywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
    };
    if (typeof body.sortOrder === "number") {
      updates.sort_order = body.sortOrder;
    }
    const { data, error } = await supabase
      .from("collections")
      .update(updates)
      .eq("id", params.id)
      .select("id, name, slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (Array.isArray(body.assignedProductIds)) {
      const assignedProductIds = body.assignedProductIds.filter((value: unknown): value is string => typeof value === "string");
      if (assignedProductIds.length) {
        await supabase.from("products").update({ collection_id: null }).eq("collection_id", params.id).not("id", "in", `(${assignedProductIds.map((id) => `"${id}"`).join(",")})`);
      } else {
        await supabase.from("products").update({ collection_id: null }).eq("collection_id", params.id);
      }
      if (assignedProductIds.length) {
        await supabase.from("products").update({ collection_id: params.id }).in("id", assignedProductIds);
      }
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "collection_admin",
      entityId: params.id,
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update collection." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("products").update({ collection_id: null }).eq("collection_id", params.id);
    const { error } = await supabase.from("collections").delete().eq("id", params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "collection_admin",
      entityId: params.id,
      action: "collection:delete",
      payload: { deleted: true, productGroupingRemovedOnly: true },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete collection." }, { status: 500 });
  }
}
