import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CUSTOMER_ACCESS_COOKIE, CUSTOMER_REFRESH_COOKIE, syncCustomerProfile } from "@/lib/supabase/customer-auth";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email || !body.password || !body.fullName) {
    return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
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

    const cookieStore = cookies();
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

    return NextResponse.json({
      redirectTo: body.next || "/account",
      message: "Account created.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Signup failed." }, { status: 500 });
  }
}
