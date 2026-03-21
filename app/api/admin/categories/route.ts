import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (!body.name || !body.slug) {
    return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        seo_title: body.seoTitle || body.name,
        seo_description: body.seoDescription || body.description || null,
        seo_keywords: Array.isArray(body.seoKeywords) ? body.seoKeywords : [],
        sort_order: body.sortOrder || 0,
      })
      .select("id, name, slug")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create category." }, { status: 500 });
  }
}
