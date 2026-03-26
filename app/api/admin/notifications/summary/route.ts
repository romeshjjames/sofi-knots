import { NextResponse } from "next/server";
import { getAdminNotificationSummary } from "@/lib/admin-notifications";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET() {
  try {
    await requireAdminApi(["super_admin", "order_admin", "content_admin", "marketing_admin"]);
    const summary = await getAdminNotificationSummary();
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load notification summary." },
      { status: 500 },
    );
  }
}
