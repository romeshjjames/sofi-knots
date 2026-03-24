import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_ACCESS_COOKIE, CUSTOMER_REFRESH_COOKIE } from "@/lib/supabase/customer-auth";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(CUSTOMER_ACCESS_COOKIE);
  cookieStore.delete(CUSTOMER_REFRESH_COOKIE);
  return NextResponse.json({ ok: true });
}
