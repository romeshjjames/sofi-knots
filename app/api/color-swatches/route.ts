import { NextResponse } from "next/server";
import { getEnabledColorSwatches } from "@/lib/color-swatches";

export async function GET() {
  const colors = await getEnabledColorSwatches();
  return NextResponse.json({ colors });
}
