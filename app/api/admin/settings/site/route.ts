import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin", "content_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json();
  try {
    const supabase = createAdminSupabaseClient();
    if (!body.siteName?.trim()) {
      return NextResponse.json({ error: "Store name is required." }, { status: 400 });
    }
    if (body.siteUrl && typeof body.siteUrl === "string" && !/^https?:\/\//.test(body.siteUrl)) {
      return NextResponse.json({ error: "Site URL must start with http:// or https://." }, { status: 400 });
    }
    const payload = {
      site_name: body.siteName,
      site_url: body.siteUrl || null,
      default_meta_title: body.defaultMetaTitle || null,
      default_meta_description: body.defaultMetaDescription || null,
      default_meta_keywords: body.defaultMetaKeywords || [],
      support_email: body.supportEmail || null,
      support_phone: body.supportPhone || null,
      social_links: body.socialLinks || {},
      updated_at: new Date().toISOString(),
    };
    let result;
    if (body.id) {
      result = await supabase.from("site_settings").update(payload).eq("id", body.id).select("id").single();
    } else {
      result = await supabase.from("site_settings").insert(payload).select("id").single();
    }
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    if (body.password?.newPassword) {
      if (body.password.newPassword !== body.password.confirmPassword) {
        return NextResponse.json({ error: "New password and confirm password must match." }, { status: 400 });
      }
      if (String(body.password.newPassword).length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      const passwordUpdate = await supabase.auth.admin.updateUserById(auth.session.user.id, {
        password: String(body.password.newPassword),
      });
      if (passwordUpdate.error) {
        return NextResponse.json({ error: passwordUpdate.error.message }, { status: 500 });
      }
    }
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "site_settings",
      entityId: result.data.id,
      action: "update",
      payload: {
        ...body,
        password: body.password?.newPassword ? { changedAt: new Date().toISOString() } : undefined,
      },
    });
    return NextResponse.json({ settings: result.data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update site settings." }, { status: 500 });
  }
}
