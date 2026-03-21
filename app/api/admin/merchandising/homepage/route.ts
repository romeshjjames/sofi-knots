import { NextResponse } from "next/server";
import { createAuditLog, defaultHomepageSections, getHomepageMerchandising, type HomepageSectionKey } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET() {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const merchandising = await getHomepageMerchandising();
    return NextResponse.json({ merchandising, sections: defaultHomepageSections });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load homepage merchandising." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const allowedKeys = new Set(defaultHomepageSections.map((section) => section.key));
  const sectionOrder = Array.isArray(body.sectionOrder)
    ? body.sectionOrder.filter((value: unknown): value is HomepageSectionKey => typeof value === "string" && allowedKeys.has(value as HomepageSectionKey))
    : [];

  try {
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "merchandising",
      entityId: "homepage_sections",
      action: "sections:reorder",
      payload: { sectionOrder },
    });

    return NextResponse.json({
      merchandising: {
        sectionOrder,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save homepage merchandising." }, { status: 500 });
  }
}
