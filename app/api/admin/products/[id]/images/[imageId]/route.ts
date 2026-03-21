import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string; imageId: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json();
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("product_images")
      .update({
        image_url: body.imageUrl,
        alt_text: body.altText || null,
        sort_order: body.sortOrder ?? 0,
      })
      .eq("id", params.imageId)
      .eq("product_id", params.id)
      .select("id, product_id, image_url, alt_text, sort_order")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "product", entityId: params.id, action: "image:update", payload: body });
    return NextResponse.json({
      image: {
        id: data.id,
        productId: data.product_id,
        imageUrl: data.image_url,
        altText: data.alt_text,
        sortOrder: data.sort_order,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update image." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string; imageId: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("product_images").delete().eq("id", params.imageId).eq("product_id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "product", entityId: params.id, action: "image:delete", payload: { imageId: params.imageId } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete image." }, { status: 500 });
  }
}
