import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string; variantId: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json();
  try {
    const supabase = createAdminSupabaseClient();
    if (body.isDefault) {
      await supabase.from("product_variants").update({ is_default: false }).eq("product_id", params.id);
    }
    const { data, error } = await supabase
      .from("product_variants")
      .update({
        title: body.title,
        sku: body.sku || null,
        price_inr: body.priceInr,
        compare_at_price_inr: body.compareAtPriceInr || null,
        stock_quantity: body.stockQuantity ?? 0,
        attributes: body.attributes || {},
        is_default: Boolean(body.isDefault),
      })
      .eq("id", params.variantId)
      .eq("product_id", params.id)
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "product", entityId: params.id, action: "variant:update", payload: body });
    return NextResponse.json({ variant: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update variant." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string; variantId: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("product_variants").delete().eq("id", params.variantId).eq("product_id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "product", entityId: params.id, action: "variant:delete", payload: { variantId: params.variantId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete variant." }, { status: 500 });
  }
}
