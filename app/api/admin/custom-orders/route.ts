import { NextResponse } from "next/server";
import { createCustomOrder } from "@/lib/custom-orders";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "order_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    await createCustomOrder(
      {
        id: body.id,
        customerName: body.customerName || "",
        email: body.email || "",
        phone: body.phone || "",
        productType: body.productType || "",
        requestSummary: body.requestSummary || "",
        budget: body.budget || "",
        status: body.status || "new",
        submittedAt: body.submittedAt || new Date().toISOString().slice(0, 10),
        estimatedPrice: body.estimatedPrice || "",
        assignedTeamMember: body.assignedTeamMember || "",
        expectedCompletionDate: body.expectedCompletionDate || null,
        updatedAt: null,
        customizationDetails: body.customizationDetails || "",
        preferredColors: body.preferredColors || "",
        preferredMaterials: body.preferredMaterials || "",
        quantity: typeof body.quantity === "number" ? body.quantity : null,
        referenceNotes: body.referenceNotes || "",
        referenceImages: Array.isArray(body.referenceImages) ? body.referenceImages : [],
        timelineNotes: body.timelineNotes || "",
        internalNotes: body.internalNotes || "",
        productionTimeline: body.productionTimeline || "",
        shippingEstimate: body.shippingEstimate || "",
        specialConditions: body.specialConditions || "",
        confirmedPrice: body.confirmedPrice || "",
        paymentStatus: body.paymentStatus || "",
        trackingDetails: body.trackingDetails || "",
        completionNotes: body.completionNotes || "",
        dispatchNotes: body.dispatchNotes || "",
        finalPaymentNotes: body.finalPaymentNotes || "",
        cancellationReason: body.cancellationReason || "",
      },
      auth.session.user.id,
    );

    return NextResponse.json({ customOrderId: body.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create custom order." }, { status: 500 });
  }
}
