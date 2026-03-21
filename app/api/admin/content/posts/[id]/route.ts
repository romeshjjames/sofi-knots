import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json();
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        body: body.body ?? [],
        cover_image_url: body.coverImageUrl || null,
        author_name: body.authorName || null,
        published_at: body.publishedAt || null,
        status: body.status || "draft",
        seo_title: body.seoTitle || body.title,
        seo_description: body.seoDescription || body.excerpt || null,
        seo_keywords: body.seoKeywords || [],
        canonical_url: body.canonicalUrl || null,
      })
      .eq("id", params.id)
      .select("id, title, slug")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "blog_post", entityId: params.id, action: "update", payload: body });
    return NextResponse.json({ post: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "blog_post", entityId: params.id, action: "delete" });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete post." }, { status: 500 });
  }
}
