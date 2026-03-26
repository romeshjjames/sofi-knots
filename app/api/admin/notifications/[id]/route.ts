import { NextResponse } from "next/server";
import { updateAdminNotificationState } from "@/lib/admin-notifications";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdminApi(["super_admin", "order_admin", "content_admin", "marketing_admin"]);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = (await request.json()) as Record<string, unknown>;

    await updateAdminNotificationState(params.id, {
      isRead: body.isRead === true,
      deleted: body.deleted === true,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update notification state." },
      { status: 500 },
    );
  }
}
