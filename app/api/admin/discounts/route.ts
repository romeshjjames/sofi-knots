import { NextResponse } from "next/server";
import { createDiscount } from "@/lib/discounts";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    await createDiscount(body, auth.session.user.id);
    return NextResponse.json({ created: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create discount." }, { status: 500 });
  }
}
