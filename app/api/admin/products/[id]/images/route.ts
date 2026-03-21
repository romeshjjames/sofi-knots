import { NextResponse } from "next/server";
import { createAuditLog, getProductImages } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const images = await getProductImages(params.id);
    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch images." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: params.id,
        image_url: body.imageUrl,
        alt_text: body.altText || null,
        sort_order: body.sortOrder ?? 0,
      })
      .select("id, product_id, image_url, alt_text, sort_order")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "product",
      entityId: params.id,
      action: "image:create",
      payload: body,
    });

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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create image." }, { status: 500 });
  }
}
