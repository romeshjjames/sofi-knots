import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("collections")
      .update({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image_url: body.imageUrl || null,
        seo_title: body.seoTitle || body.name,
        seo_description: body.seoDescription || body.description || null,
        seo_keywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
      })
      .eq("id", params.id)
      .select("id, name, slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ collection: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update collection." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("collections").delete().eq("id", params.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete collection." }, { status: 500 });
  }
}
