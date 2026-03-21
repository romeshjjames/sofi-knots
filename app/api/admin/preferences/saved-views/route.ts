import { NextResponse } from "next/server";
import { createAuditLog, getSavedViews } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope");
  if (!scope) {
    return NextResponse.json({ error: "scope is required." }, { status: 400 });
  }

  try {
    const state = await getSavedViews(auth.session.user.id, scope);
    return NextResponse.json({ state });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load saved views." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  if (typeof body.scope !== "string" || !body.scope) {
    return NextResponse.json({ error: "scope is required." }, { status: 400 });
  }

  try {
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "admin_preferences",
      entityId: `${auth.session.user.id}:${body.scope}`,
      action: "saved_views:update",
      payload: {
        views: Array.isArray(body.views) ? body.views : [],
        activeViewId: typeof body.activeViewId === "string" ? body.activeViewId : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save views." }, { status: 500 });
  }
}
