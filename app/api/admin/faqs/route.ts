import { NextResponse } from "next/server";
import { createFaq } from "@/lib/faqs";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();

  try {
    await createFaq(
      {
        question: body.question || "",
        answer: body.answer || "",
        category: body.category || "General",
        displayOrder: typeof body.displayOrder === "number" ? body.displayOrder : 1,
        status: body.status === "inactive" ? "inactive" : "active",
      },
      auth.session.user.id,
    );

    return NextResponse.json({ created: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create FAQ." }, { status: 500 });
  }
}
