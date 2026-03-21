import crypto from "crypto";
import { env } from "@/lib/env";

type CreateOrderInput = {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
};

export async function createRazorpayOrder(input: CreateOrderInput) {
  const keyId = env.required("RAZORPAY_KEY_ID");
  const keySecret = env.required("RAZORPAY_KEY_SECRET");
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed with status ${response.status}`);
  }

  return response.json();
}

export function verifyRazorpayPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = env.required("RAZORPAY_KEY_SECRET");
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return digest === signature;
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string) {
  const secret = env.required("RAZORPAY_WEBHOOK_SECRET");
  const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return digest === signature;
}
