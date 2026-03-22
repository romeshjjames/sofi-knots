import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { buildCopyLabel, buildCopySlug } from "@/lib/admin-clone";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const supabase = createAdminSupabaseClient();
    const [{ data: source, error: sourceError }, { data: existing, error: existingError }] = await Promise.all([
      supabase.from("pages").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("pages").select("title, slug"),
    ]);

    if (sourceError) return NextResponse.json({ error: sourceError.message }, { status: 500 });
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (!source) return NextResponse.json({ error: "Page not found." }, { status: 404 });

    const existingTitles = new Set((existing ?? []).map((item) => String(item.title).toLowerCase()));
    const existingSlugs = new Set((existing ?? []).map((item) => String(item.slug).toLowerCase()));
    const nextTitle = buildCopyLabel(source.title, existingTitles);
    const nextSlug = buildCopySlug(source.slug, existingSlugs);

    const { data: clone, error: cloneError } = await supabase
      .from("pages")
      .insert({
        title: nextTitle,
        slug: nextSlug,
        excerpt: source.excerpt,
        body: source.body ?? [],
        status: "draft",
        seo_title: source.seo_title ? `${source.seo_title} Copy` : nextTitle,
        seo_description: source.seo_description,
        seo_keywords: source.seo_keywords ?? [],
        canonical_url: null,
      })
      .select("id, title, slug")
      .single();

    if (cloneError) return NextResponse.json({ error: cloneError.message }, { status: 500 });

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "page",
      entityId: clone.id,
      action: "clone",
      payload: {
        sourceId: params.id,
        sourceSlug: source.slug,
      },
    });

    return NextResponse.json({ page: clone });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to clone page." }, { status: 500 });
  }
}
