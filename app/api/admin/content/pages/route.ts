import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json();
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("pages")
      .insert({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        body: body.body ?? [],
        status: body.status || "draft",
        seo_title: body.seoTitle || body.title,
        seo_description: body.seoDescription || body.excerpt || null,
        seo_keywords: body.seoKeywords || [],
        canonical_url: body.canonicalUrl || null,
      })
      .select("id, title, slug")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "page", entityId: data.id, action: "create", payload: body });
    return NextResponse.json({ page: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create page." }, { status: 500 });
  }
}
