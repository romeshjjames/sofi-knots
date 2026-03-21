import { NextResponse } from "next/server";
import { createAuditLog, getCollectionMerchandising } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET() {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const merchandising = await getCollectionMerchandising();
    return NextResponse.json({ merchandising });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load collection merchandising." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const collectionIds = Array.isArray(body.collectionIds) ? body.collectionIds.filter((value: unknown): value is string => typeof value === "string" && value.length > 0) : [];

  try {
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "merchandising",
      entityId: "homepage_collections",
      action: "collections:reorder",
      payload: { collectionIds },
    });

    return NextResponse.json({
      merchandising: {
        collectionIds,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save collection merchandising." }, { status: 500 });
  }
}
