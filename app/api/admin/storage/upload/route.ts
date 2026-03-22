import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createAuditLog } from "@/lib/admin-data";
import { requireAdminApi } from "@/lib/supabase/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const BUCKET = "product-media";

export async function POST(request: Request) {
  const auth = await requireAdminApi(["super_admin", "catalog_admin", "content_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "products");
    const altText = String(formData.get("altText") || "").trim();
    const category = String(formData.get("category") || "").trim();
    const tags = String(formData.get("tags") || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const mediaType = String(formData.get("mediaType") || "image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const key = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    const mediaId = randomUUID();

    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.storage.from(BUCKET).upload(key, bytes, {
      contentType: file.type || `image/${ext}`,
      upsert: false,
    });

    if (error) {
      return NextResponse.json(
        { error: `${error.message}. Make sure a Supabase Storage bucket named '${BUCKET}' exists.` },
        { status: 500 },
      );
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
    await createAuditLog({
      actorUserId: auth.session.user.id,
      entityType: "media_library",
      entityId: mediaId,
      action: "upload",
      payload: {
        id: mediaId,
        fileName: file.name,
        path: key,
        publicUrl: data.publicUrl,
        altText: altText || null,
        category: category || null,
        tags,
        mediaType,
      },
    });

    return NextResponse.json({ id: mediaId, path: key, publicUrl: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
