import { NextResponse } from "next/server";
import { createCustomer } from "@/lib/customers";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin", "order_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    const customerId = await createCustomer({
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      email: body.email || "",
      phone: body.phone || "",
      notes: body.notes || "",
      tags: Array.isArray(body.tags) ? body.tags : [],
      addresses: Array.isArray(body.addresses) ? body.addresses : [],
      actorUserId: auth.session.user.id,
    });

    return NextResponse.json({ customerId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create customer." }, { status: 500 });
  }
}
