import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.eventName || !body.sessionId) {
      return NextResponse.json({ error: "eventName and sessionId are required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("audit_logs").insert({
      entity_type: "analytics_event",
      entity_id: String(body.sessionId),
      action: String(body.eventName),
      payload: {
        path: body.path || null,
        referrer: body.referrer || null,
        attribution: body.attribution || null,
        metadata: body.metadata || {},
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tracked: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to track analytics event." }, { status: 500 });
  }
}
