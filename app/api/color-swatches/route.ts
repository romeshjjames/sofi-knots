import { NextResponse } from "next/server";
import { colorSwatches } from "@/lib/color-swatches";

export async function GET() {
  return NextResponse.json({ colors: colorSwatches });
}
