import { NextResponse } from "next/server";
import { clearInventoryRecord, createInventoryAdjustment, updateInventoryRecord } from "@/lib/inventory";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    await updateInventoryRecord(params.id, {
      sku: body.sku || "",
      inventoryQuantity: typeof body.inventoryQuantity === "number" ? body.inventoryQuantity : 0,
      inventoryTracking: body.inventoryTracking !== false,
      continueSellingWhenOutOfStock: body.continueSellingWhenOutOfStock === true,
      location: body.location || "Main studio",
      safetyStock: typeof body.safetyStock === "number" ? body.safetyStock : 0,
      incomingStock: typeof body.incomingStock === "number" ? body.incomingStock : 0,
      reservedStock: typeof body.reservedStock === "number" ? body.reservedStock : 0,
      actorUserId: auth.session.user.id,
    });

    if (body.adjustment && typeof body.adjustment === "object" && typeof body.adjustment.delta === "number" && body.adjustment.delta !== 0) {
      await createInventoryAdjustment(params.id, {
        delta: body.adjustment.delta,
        reason:
          body.adjustment.reason === "damage" ||
          body.adjustment.reason === "manual_correction" ||
          body.adjustment.reason === "return" ||
          body.adjustment.reason === "transfer" ||
          body.adjustment.reason === "cancellation"
            ? body.adjustment.reason
            : "restock",
        note: typeof body.adjustment.note === "string" ? body.adjustment.note : "",
        actorUserId: auth.session.user.id,
      });
    }

    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update inventory." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await clearInventoryRecord(params.id, auth.session.user.id);
    return NextResponse.json({ cleared: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to clear inventory." }, { status: 500 });
  }
}
