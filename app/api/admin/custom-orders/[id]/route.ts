import { NextResponse } from "next/server";
import { deleteCustomOrder, updateCustomOrder } from "@/lib/custom-orders";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "order_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    await updateCustomOrder(
      params.id,
      {
        id: params.id,
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
        updatedAt: body.updatedAt || null,
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

    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update custom order." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "order_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await deleteCustomOrder(params.id, auth.session.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete custom order." }, { status: 500 });
  }
}
