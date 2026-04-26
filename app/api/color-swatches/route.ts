import { NextResponse } from "next/server";
import { getEnabledColorSwatches } from "@/lib/color-swatches";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const colors = await getEnabledColorSwatches();
  return NextResponse.json({ colors });
}
