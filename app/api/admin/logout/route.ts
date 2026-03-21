import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/supabase/auth";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_ACCESS_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_COOKIE);
  return NextResponse.json({ ok: true });
}
