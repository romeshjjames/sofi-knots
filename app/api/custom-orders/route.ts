import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createCustomOrder } from "@/lib/custom-orders";
import { getEnabledColorSwatches } from "@/lib/color-swatches";
import { getCustomerSession } from "@/lib/supabase/customer-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const session = await getCustomerSession().catch(() => ({ user: null, customerId: null }));
    const colorSwatches = await getEnabledColorSwatches();

    const productId = String(body.product_id ?? "").trim();
    const productName = String(body.product_name ?? "").trim();
    const customerName = String(body.customer_name ?? session.user?.fullName ?? "").trim();
    const email = String(body.email ?? session.user?.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? session.user?.phone ?? "").trim();
    const colorId = String(body.color_id ?? "").trim();
    const message = String(body.message ?? "").trim();
    const imageUrls = Array.isArray(body.image_urls)
      ? body.image_urls.filter((value): value is string => typeof value === "string" && Boolean(value))
      : [];

    if (!productId || !productName || !customerName || !email || !phone || !colorId || !message) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const selectedColor = colorSwatches.find((color) => color.id === colorId);
    if (!selectedColor) {
      return NextResponse.json({ error: "Please select a valid color." }, { status: 400 });
    }

    const now = new Date();
    const customOrderId = `co-${randomUUID()}`;

    await createCustomOrder({
      id: customOrderId,
      customerName,
      email,
      phone,
      productType: productName,
      requestSummary: message,
      budget: "",
      status: "new",
      submittedAt: now.toISOString().slice(0, 10),
      estimatedPrice: "",
      assignedTeamMember: "",
      expectedCompletionDate: null,
      updatedAt: null,
      customizationDetails: message,
      preferredColors: selectedColor.name,
      preferredMaterials: "",
      quantity: 1,
      referenceNotes: `Product ID: ${productId}`,
      referenceImages: imageUrls,
      timelineNotes: "",
      internalNotes: "",
      productionTimeline: "",
      shippingEstimate: "",
      specialConditions: "",
      confirmedPrice: "",
      paymentStatus: "",
      trackingDetails: "",
      completionNotes: "",
      dispatchNotes: "",
      finalPaymentNotes: "",
      cancellationReason: "",
    }, session.user?.id ?? null);

    return NextResponse.json({
      ok: true,
      customOrderId,
      message: "Your custom order request has been submitted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to submit custom order request." }, { status: 500 });
  }
}
