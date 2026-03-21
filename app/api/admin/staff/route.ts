import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi, type AdminRole } from "@/lib/supabase/auth";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(["super_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const userId = String(body.userId || "");
  const roles = Array.isArray(body.roles) ? (body.roles as AdminRole[]) : [];

  if (!userId) {
    return NextResponse.json({ error: "User id is required." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    await supabase.from("admin_roles").delete().eq("user_id", userId);

    if (roles.length) {
      const { error } = await supabase.from("admin_roles").insert(roles.map((role) => ({ user_id: userId, role })));
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "staff",
      entityId: userId,
      action: "roles:update",
      payload: { roles },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update staff roles." }, { status: 500 });
  }
}
