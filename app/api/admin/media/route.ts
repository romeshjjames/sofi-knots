import { NextResponse } from "next/server";
import { deleteMediaAsset, getMediaAssets } from "@/lib/media-library";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function GET() {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const assets = await getMediaAssets();
    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load media assets." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin", "marketing_admin"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    if (!body?.id || !body?.path) {
      return NextResponse.json({ error: "Media id and path are required." }, { status: 400 });
    }

    await deleteMediaAsset({
      id: String(body.id),
      path: String(body.path),
      actorUserId: auth.session.user.id,
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete media asset." }, { status: 500 });
  }
}
