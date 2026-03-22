import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json();
  try {
    const adminStatus = body.adminStatus === "scheduled" || body.adminStatus === "published" ? body.adminStatus : "draft";
    const publishedAt =
      adminStatus === "published"
        ? body.publishedAt || new Date().toISOString()
        : adminStatus === "scheduled"
          ? body.scheduledFor || body.publishedAt || null
          : null;
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        body: body.body ?? [],
        cover_image_url: body.coverImageUrl || null,
        author_name: body.authorName || null,
        published_at: publishedAt,
        status: adminStatus === "published" ? "published" : "draft",
        seo_title: body.seoTitle || body.title,
        seo_description: body.seoDescription || body.excerpt || null,
        seo_keywords: body.seoKeywords || [],
        canonical_url: body.canonicalUrl || null,
      })
      .select("id, title, slug")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await createAuditLog({ actorUserId: auth.session.user.id, entityType: "blog_post", entityId: data.id, action: "create", payload: body });
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "blog_post_admin",
      entityId: data.id,
      action: "settings:update",
      payload: {
        blogType: body.blogType || "Article",
        category: body.category || "Editorial",
        tags: Array.isArray(body.tags) ? body.tags : [],
        adminStatus,
        scheduledFor: body.scheduledFor || null,
        featuredArticle: body.featuredArticle === true,
        featureOnHomepage: body.featureOnHomepage === true,
        highlightInBlog: body.highlightInBlog === true,
      },
    });
    return NextResponse.json({ post: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create post." }, { status: 500 });
  }
}
