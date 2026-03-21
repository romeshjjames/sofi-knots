import { NextResponse } from "next/server";
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

  return NextResponse.json({
    received: true,
    updatedOrder,
  });
}
