import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const BUCKET = "product-media";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const uploads = await Promise.all(
      files.map(async (file) => {
        if (!ALLOWED_TYPES.has(file.type)) {
          throw new Error("Only JPG, PNG, and WEBP files are allowed.");
        }

        const bytes = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
        const key = `custom-orders/${Date.now()}-${randomUUID()}-${safeName}`;

        const { error } = await supabase.storage.from(BUCKET).upload(key, bytes, {
          contentType: file.type,
          upsert: false,
        });

        if (error) {
          throw new Error(error.message);
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
        return data.publicUrl;
      }),
    );

    return NextResponse.json({ imageUrls: uploads });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
