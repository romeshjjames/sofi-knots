import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";
import { updateOrderStatuses } from "@/lib/orders";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "order_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    const order = await updateOrderStatuses(params.id, {
      status: body.status,
      paymentStatus: body.paymentStatus,
      fulfillmentStatus: body.fulfillmentStatus,
      notes: body.notes,
    });

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "order",
      entityId: params.id,
      action: "status:update",
      payload: body,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update order." }, { status: 500 });
  }
}
