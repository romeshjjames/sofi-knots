import { NextResponse } from "next/server";
import { deleteFaq, updateFaq } from "@/lib/faqs";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();

  try {
    await updateFaq(
      params.id,
      {
        question: body.question || "",
        answer: body.answer || "",
        category: body.category || "General",
        displayOrder: typeof body.displayOrder === "number" ? body.displayOrder : 1,
        status: body.status === "inactive" ? "inactive" : "active",
      },
      auth.session.user.id,
    );

    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update FAQ." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await deleteFaq(params.id, auth.session.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete FAQ." }, { status: 500 });
  }
}
