import { NextResponse } from "next/server";
import { deleteColorSwatch, updateColorSwatch } from "@/lib/color-swatches";
import { requireAdminApi } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const hex = typeof body.hex === "string" ? body.hex : null;
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
    const isEnabled = body.isEnabled !== false;

    if (!name) {
      return NextResponse.json({ error: "Color name is required." }, { status: 400 });
    }

    if (!hex && !imageUrl) {
      return NextResponse.json({ error: "Provide either a HEX color or a swatch image." }, { status: 400 });
    }

    await updateColorSwatch(params.id, { name, hex, imageUrl, isEnabled }, auth.session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update color swatch." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    await deleteColorSwatch(params.id, auth.session.user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete color swatch." }, { status: 500 });
  }
}
