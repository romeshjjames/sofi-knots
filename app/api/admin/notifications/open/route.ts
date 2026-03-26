import { NextResponse } from "next/server";
import { updateAdminNotificationState } from "@/lib/admin-notifications";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  try {
    await requireAdminApi(["super_admin", "order_admin", "content_admin", "marketing_admin"]);

    const url = new URL(request.url);
    const notificationId = url.searchParams.get("notificationId");
    const href = url.searchParams.get("href");

    if (!notificationId || !href || !href.startsWith("/")) {
      return NextResponse.redirect(new URL("/admin/notifications", request.url));
    }

    await updateAdminNotificationState(notificationId, { isRead: true, deleted: false });
    return NextResponse.redirect(new URL(href, request.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/notifications", request.url));
  }
}
