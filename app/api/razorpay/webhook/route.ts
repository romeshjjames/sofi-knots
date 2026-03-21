import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { markOrderFromWebhook } from "@/lib/orders";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing Razorpay signature." }, { status: 400 });
  }

  if (!verifyRazorpayWebhookSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid Razorpay signature." }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const entity = event?.payload?.payment?.entity;
  const updatedOrder = await markOrderFromWebhook({
    event: event.event,
    orderId: entity?.order_id,
    paymentId: entity?.id,
  });

  await createAuditLog({
    entityType: "analytics_event",
    entityId: entity?.order_id || "unknown_razorpay_order",
    action: event.event === "payment.captured" ? "payment_captured_webhook" : event.event === "payment.failed" ? "payment_failed_webhook" : "payment_event",
    payload: {
      event: event.event,
      razorpayOrderId: entity?.order_id || null,
      razorpayPaymentId: entity?.id || null,
      localOrderId: updatedOrder?.id || null,
      localOrderNumber: updatedOrder?.order_number || null,
    },
  });

  return NextResponse.json({
    received: true,
    updatedOrder,
  });
}
