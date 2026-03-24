import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CUSTOMER_CAPTCHA_COOKIE } from "@/lib/customer-captcha";

export async function GET() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 8) + 1;
  const answer = String(left + right);
  const expiresAt = Date.now() + 1000 * 60 * 10;

  cookies().set(CUSTOMER_CAPTCHA_COOKIE, JSON.stringify({ answer, expiresAt }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.json({
    prompt: `What is ${left} + ${right}?`,
  });
}
