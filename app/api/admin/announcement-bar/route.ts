import { NextResponse } from "next/server";
import { getAnnouncementBar, updateAnnouncementBar } from "@/lib/announcement-bar";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET() {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const record = await getAnnouncementBar();
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load announcement bar." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    await updateAnnouncementBar(
      {
        text: typeof body.text === "string" ? body.text : "",
        ctaLink: typeof body.ctaLink === "string" ? body.ctaLink : null,
        isActive: body.isActive === true,
        startsAt: typeof body.startsAt === "string" ? body.startsAt : null,
        endsAt: typeof body.endsAt === "string" ? body.endsAt : null,
      },
      auth.session.user.id,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save announcement bar." }, { status: 500 });
  }
}
