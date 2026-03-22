import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";
import { updateOrderStatuses } from "@/lib/orders";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

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
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      tags: body.tags,
      internalComments: body.internalComments,
      customItemNotes: body.customItemNotes,
      shippingPartner: body.shippingPartner,
      trackingNumber: body.trackingNumber,
      shippingMethod: body.shippingMethod,
      estimatedDelivery: body.estimatedDelivery,
      cancellationReason: body.cancellationReason,
      refundReason: body.refundReason,
      refundAmountInr: body.refundAmountInr,
      refundShipping: body.refundShipping,
      restockItems: body.restockItems,
      archived: body.archived,
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "order_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "archive";

  try {
    const supabase = createAdminSupabaseClient();

    if (mode === "delete") {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("status, order_number")
        .eq("id", params.id)
        .single();

      if (orderError) {
        return NextResponse.json({ error: orderError.message }, { status: 500 });
      }

      const status = order.status?.toLowerCase();
      if (status !== "cancelled" && status !== "refunded") {
        return NextResponse.json({ error: "Cancel or refund the order before deleting it." }, { status: 400 });
      }

      const { error } = await supabase.from("orders").delete().eq("id", params.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await createAuditLog({
        actorUserId: auth.session.user.id,
        entityType: "order",
        entityId: params.id,
        action: "order:delete",
        payload: { mode: "delete" },
      });

      return NextResponse.json({ deleted: true });
    }

    await updateOrderStatuses(params.id, { archived: true });

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "order",
      entityId: params.id,
      action: "order:archive",
      payload: { mode: "archive" },
    });

    return NextResponse.json({ archived: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to remove order." }, { status: 500 });
  }
}
