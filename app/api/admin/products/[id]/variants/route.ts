import { NextResponse } from "next/server";
import { createAuditLog, getProductVariants } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const variants = await getProductVariants(params.id);
    return NextResponse.json({ variants });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch variants." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
      .insert({
        product_id: params.id,
        title: body.title,
        sku: body.sku || null,
        price_inr: body.priceInr,
        compare_at_price_inr: body.compareAtPriceInr || null,
        stock_quantity: body.stockQuantity ?? 0,
        attributes: body.attributes || {},
        is_default: Boolean(body.isDefault),
      })
      .select("id, product_id, title, sku, price_inr, compare_at_price_inr, stock_quantity, attributes, is_default")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "product", entityId: params.id, action: "variant:create", payload: body });
    return NextResponse.json({
      variant: {
        id: data.id,
        productId: data.product_id,
        title: data.title,
        sku: data.sku,
        priceInr: data.price_inr,
        compareAtPriceInr: data.compare_at_price_inr,
        stockQuantity: data.stock_quantity,
        attributes: data.attributes,
        isDefault: data.is_default,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create variant." }, { status: 500 });
  }
}
