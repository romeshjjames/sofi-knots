import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { buildCopyLabel, buildCopySlug } from "@/lib/admin-clone";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const supabase = createAdminSupabaseClient();
    const [{ data: source, error: sourceError }, { data: existing, error: existingError }] = await Promise.all([
      supabase.from("collections").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("collections").select("name, slug"),
    ]);

    if (sourceError) return NextResponse.json({ error: sourceError.message }, { status: 500 });
    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
    if (!source) return NextResponse.json({ error: "Collection not found." }, { status: 404 });

    const existingNames = new Set((existing ?? []).map((item) => String(item.name).toLowerCase()));
    const existingSlugs = new Set((existing ?? []).map((item) => String(item.slug).toLowerCase()));
    const nextName = buildCopyLabel(source.name, existingNames);
    const nextSlug = buildCopySlug(source.slug, existingSlugs);

    const { data: clone, error: cloneError } = await supabase
      .from("collections")
      .insert({
        name: nextName,
        slug: nextSlug,
        description: source.description,
        image_url: source.image_url,
        seo_title: source.seo_title ? `${source.seo_title} Copy` : nextName,
        seo_description: source.seo_description,
        seo_keywords: source.seo_keywords ?? [],
        sort_order: source.sort_order ?? 0,
      })
      .select("id, name, slug")
      .single();

    if (cloneError) return NextResponse.json({ error: cloneError.message }, { status: 500 });

    const [{ data: settingsLog, error: settingsError }, { data: contentLog, error: contentError }] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("payload")
        .eq("entity_type", "collection_admin")
        .eq("entity_id", params.id)
        .eq("action", "settings:update")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("audit_logs")
        .select("payload")
        .eq("entity_type", "collection_page_content")
        .eq("entity_id", params.id)
        .eq("action", "content:update")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (settingsError || contentError) {
      return NextResponse.json({ error: settingsError?.message || contentError?.message || "Failed to load collection clone data." }, { status: 500 });
    }

    const settingsPayload = (settingsLog?.payload ?? {}) as Record<string, unknown>;
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "collection_admin",
      entityId: clone.id,
      action: "settings:update",
      payload: {
        ...settingsPayload,
        status: "draft",
      },
    });

    const pageBody = (contentLog?.payload as { body?: unknown[] } | null)?.body;
    if (Array.isArray(pageBody)) {
      await createAuditLog({
        actorUserId: auth.session.user.id,
        entityType: "collection_page_content",
        entityId: clone.id,
        action: "content:update",
        payload: { body: pageBody },
      });
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "collection",
      entityId: clone.id,
      action: "clone",
      payload: { sourceId: params.id, sourceSlug: source.slug },
    });

    return NextResponse.json({ collection: clone });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to clone collection." }, { status: 500 });
  }
}
