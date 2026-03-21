import { NextResponse } from "next/server";
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

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const key = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;

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
    return NextResponse.json({ path: key, publicUrl: data.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
