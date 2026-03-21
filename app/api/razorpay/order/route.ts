import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createRazorpayOrder } from "@/lib/razorpay";
import { createPendingOrder, linkRazorpayOrder } from "@/lib/orders";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.customer?.email || !body.customer?.fullName || !Array.isArray(body.items) || !body.items.length) {
    return NextResponse.json({ error: "Customer and cart items are required." }, { status: 400 });
  }

  try {
    const pendingOrder = await createPendingOrder({
      customer: body.customer,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress || body.shippingAddress,
      items: body.items,
      notes: body.notes,
    });

    const order = await createRazorpayOrder({
      amount: pendingOrder.total_inr * 100,
      receipt: pendingOrder.order_number,
      notes: {
        local_order_id: pendingOrder.id,
        local_order_number: pendingOrder.order_number,
      },
    });

    await linkRazorpayOrder(pendingOrder.id, order.id);

    if (body.analytics?.sessionId) {
      await createAuditLog({
        entityType: "analytics_event",
        entityId: String(body.analytics.sessionId),
        action: "checkout_created",
        payload: {
          localOrderId: pendingOrder.id,
          localOrderNumber: pendingOrder.order_number,
          totalInr: pendingOrder.total_inr,
          razorpayOrderId: order.id,
          customerEmail: body.customer.email,
          attribution: body.analytics.attribution || null,
          items: body.items,
        },
      });
    }

    return NextResponse.json({
      razorpayOrder: order,
      localOrder: {
        id: pendingOrder.id,
        orderNumber: pendingOrder.order_number,
        totalInr: pendingOrder.total_inr,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create Razorpay order." },
      { status: 500 },
    );
  }
}
