import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CUSTOMER_CAPTCHA_COOKIE } from "@/lib/customer-captcha";
import { CUSTOMER_ACCESS_COOKIE, CUSTOMER_REFRESH_COOKIE, syncCustomerProfile } from "@/lib/supabase/customer-auth";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email || !body.password || !body.fullName) {
    return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  const cookieStore = cookies();
  const rawCaptcha = cookieStore.get(CUSTOMER_CAPTCHA_COOKIE)?.value;
  const honeypot = typeof body.website === "string" ? body.website.trim() : "";
  if (honeypot) {
    return NextResponse.json({ error: "Signup blocked." }, { status: 400 });
  }

  let captchaAnswer = "";
  let captchaExpiresAt = 0;
  try {
    const parsed = rawCaptcha ? (JSON.parse(rawCaptcha) as { answer?: string; expiresAt?: number }) : null;
    captchaAnswer = parsed?.answer?.trim() || "";
    captchaExpiresAt = typeof parsed?.expiresAt === "number" ? parsed.expiresAt : 0;
  } catch {
    captchaAnswer = "";
  }

  if (!captchaAnswer || captchaExpiresAt < Date.now()) {
    return NextResponse.json({ error: "Captcha expired. Please try again." }, { status: 400 });
  }

  if (String(body.captchaAnswer ?? "").trim() !== captchaAnswer) {
    return NextResponse.json({ error: "Captcha answer is incorrect." }, { status: 400 });
  }

  try {
    const adminClient = createAdminSupabaseClient();
    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
        phone: body.phone || null,
      },
    });

    if (createError || !createdUser.user?.email) {
      return NextResponse.json({ error: createError?.message || "Signup failed." }, { status: 400 });
    }

    await syncCustomerProfile({
      email: createdUser.user.email,
      fullName: body.fullName,
      phone: body.phone || null,
    });

    const authClient = createBrowserSupabaseClient();
    const { data: sessionData, error: sessionError } = await authClient.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (sessionError || !sessionData.session) {
      return NextResponse.json(
        {
          error: sessionError?.message || "Account created, but automatic login failed. Please log in manually.",
        },
        { status: 400 },
      );
    }

    cookieStore.set(CUSTOMER_ACCESS_COOKIE, sessionData.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: sessionData.session.expires_in ?? 3600,
    });
    cookieStore.set(CUSTOMER_REFRESH_COOKIE, sessionData.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    cookieStore.delete(CUSTOMER_CAPTCHA_COOKIE);

    return NextResponse.json({
      redirectTo: body.next || "/account",
      message: "Account created.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Signup failed." }, { status: 500 });
  }
}
