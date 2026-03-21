import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/admin-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const ids = Array.isArray(body.ids) ? body.ids : [];
  const action = String(body.action || "");

  if (!ids.length) {
    return NextResponse.json({ error: "Select at least one product." }, { status: 400 });
  }

  try {
    const supabase = createAdminSupabaseClient();
    if (action === "set-status") {
      const status = String(body.status || "");
      const { error } = await supabase.from("products").update({ status }).in("id", ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === "feature") {
      const { error } = await supabase.from("products").update({ is_featured: true }).in("id", ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === "unfeature") {
      const { error } = await supabase.from("products").update({ is_featured: false }).in("id", ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === "set-collection") {
      const { error } = await supabase.from("products").update({ collection_id: body.collectionId || null }).in("id", ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === "set-category") {
      const { error } = await supabase.from("products").update({ category_id: body.categoryId || null }).in("id", ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else if (action === "delete") {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "Unsupported bulk action." }, { status: 400 });
    }

    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "product",
      entityId: ids.join(","),
      action: `bulk:${action}`,
      payload: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bulk action failed." }, { status: 500 });
  }
}
