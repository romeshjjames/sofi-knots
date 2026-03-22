import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { buildCopyLabel } from "@/lib/admin-clone";
import { createDiscount, getDiscountById, getDiscounts } from "@/lib/discounts";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi(["super_admin", "marketing_admin"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [source, existing] = await Promise.all([getDiscountById(params.id), getDiscounts()]);
    if (!source) return NextResponse.json({ error: "Discount not found." }, { status: 404 });

    const existingTitles = new Set(existing.map((item) => item.title.toLowerCase()));
    const existingCodes = new Set(existing.map((item) => item.code.toLowerCase()));
    const nextTitle = buildCopyLabel(source.title, existingTitles);

    let nextCode = `${source.code}-COPY`;
    let counter = 2;
    while (existingCodes.has(nextCode.toLowerCase())) {
      nextCode = `${source.code}-COPY-${counter}`;
      counter += 1;
    }

    const clone = {
      ...source,
      id: `disc-${randomUUID()}`,
      code: nextCode,
      title: nextTitle,
      automaticName: buildCopyLabel(source.automaticName || source.title, existingTitles),
      status: "draft" as const,
      usageCount: 0,
      orderCount: 0,
      revenueImpactInr: 0,
      updatedAt: null,
    };

    await createDiscount(clone, auth.session.user.id);
    return NextResponse.json({ discount: { id: clone.id, code: clone.code, title: clone.title } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to clone discount." }, { status: 500 });
  }
}
