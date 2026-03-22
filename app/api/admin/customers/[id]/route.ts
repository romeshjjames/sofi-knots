import { NextResponse } from "next/server";
import { deleteCustomer, updateCustomer } from "@/lib/customers";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin", "order_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    await updateCustomer(params.id, {
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      email: body.email || "",
      phone: body.phone || "",
      notes: body.notes || "",
      tags: Array.isArray(body.tags) ? body.tags : [],
      addresses: Array.isArray(body.addresses) ? body.addresses : [],
      actorUserId: auth.session.user.id,
    });

    return NextResponse.json({ updated: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update customer." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin", "order_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await deleteCustomer(params.id, auth.session.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete customer." }, { status: 500 });
  }
}
