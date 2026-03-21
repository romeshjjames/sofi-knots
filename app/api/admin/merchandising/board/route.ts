import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const featuredProductIds = Array.isArray(body.featuredProductIds)
    ? body.featuredProductIds.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
    : [];
  const collectionIds = Array.isArray(body.collectionIds)
    ? body.collectionIds.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
    : [];
  const homepageSectionOrder = Array.isArray(body.homepageSectionOrder)
    ? body.homepageSectionOrder.filter((value: unknown): value is string => typeof value === "string" && value.length > 0)
    : [];

  try {
    await Promise.all([
      createAuditLog({
        actorUserId: auth.session.user.id,
        entityType: "merchandising",
        entityId: "featured_products",
        action: "featured:reorder",
        payload: { productIds: featuredProductIds },
      }),
      createAuditLog({
        actorUserId: auth.session.user.id,
        entityType: "merchandising",
        entityId: "homepage_collections",
        action: "collections:reorder",
        payload: { collectionIds },
      }),
      createAuditLog({
        actorUserId: auth.session.user.id,
        entityType: "merchandising",
        entityId: "homepage_sections",
        action: "sections:reorder",
        payload: { sectionOrder: homepageSectionOrder },
      }),
    ]);

    return NextResponse.json({ updatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save merchandising board." }, { status: 500 });
  }
}
