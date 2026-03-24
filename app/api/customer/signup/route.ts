import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CUSTOMER_ACCESS_COOKIE, CUSTOMER_REFRESH_COOKIE, syncCustomerProfile } from "@/lib/supabase/customer-auth";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email || !body.password || !body.fullName) {
    return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  try {
    const authClient = createBrowserSupabaseClient();
    const { data, error } = await authClient.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.fullName,
          phone: body.phone || null,
        },
      },
    });

    if (error || !data.user?.email) {
      return NextResponse.json({ error: error?.message || "Signup failed." }, { status: 400 });
    }

    await syncCustomerProfile({
      email: data.user.email,
      fullName: body.fullName,
      phone: body.phone || null,
    });

    if (data.session) {
      const cookieStore = cookies();
      cookieStore.set(CUSTOMER_ACCESS_COOKIE, data.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: data.session.expires_in ?? 3600,
      });
      cookieStore.set(CUSTOMER_REFRESH_COOKIE, data.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.json({
      redirectTo: data.session ? body.next || "/account" : null,
      message: data.session ? "Account created." : "Account created. Please verify your email before logging in.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Signup failed." }, { status: 500 });
  }
}
