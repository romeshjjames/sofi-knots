import { NextResponse } from "next/server";
import { createAuditLog, getFeaturedProductMerchandising } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET() {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const merchandising = await getFeaturedProductMerchandising();
    return NextResponse.json({ merchandising });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load featured merchandising." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const productIds = Array.isArray(body.productIds) ? body.productIds.filter((value: unknown): value is string => typeof value === "string" && value.length > 0) : [];

  try {
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "merchandising",
      entityId: "featured_products",
      action: "featured:reorder",
      payload: { productIds },
    });

    return NextResponse.json({
      merchandising: {
        productIds,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save featured merchandising." }, { status: 500 });
  }
}
