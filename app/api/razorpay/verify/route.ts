import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { markOrderPaid } from "@/lib/orders";
import { verifyRazorpayPaymentSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
    return NextResponse.json({ error: "Missing Razorpay payment verification fields." }, { status: 400 });
  }

  const isValid = verifyRazorpayPaymentSignature({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid Razorpay signature." }, { status: 401 });
  }

  try {
    const order = await markOrderPaid({
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
    });

    await createAuditLog({
      entityType: "analytics_event",
      entityId: body.razorpay_order_id,
      action: "payment_captured",
      payload: {
        localOrderId: order.id,
        localOrderNumber: order.order_number,
        razorpayOrderId: body.razorpay_order_id,
        razorpayPaymentId: body.razorpay_payment_id,
      },
    });

    return NextResponse.json({ verified: true, order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to mark order paid." }, { status: 500 });
  }
}
