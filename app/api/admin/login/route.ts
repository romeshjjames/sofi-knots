import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/supabase/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const authClient = createBrowserSupabaseClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error || !data.session || !data.user) {
      return NextResponse.json({ error: error?.message || "Login failed." }, { status: 401 });
    }

    const adminClient = createAdminSupabaseClient();
    const { data: roles } = await adminClient
      .from("admin_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .limit(1);

    if (!roles?.length) {
      return NextResponse.json(
        { error: "This user does not have an admin role yet. Add a row in public.admin_roles for this account." },
        { status: 403 },
      );
    }

    const cookieStore = cookies();
    cookieStore.set(ADMIN_ACCESS_COOKIE, data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: data.session.expires_in ?? 3600,
    });
    cookieStore.set(ADMIN_REFRESH_COOKIE, data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ redirectTo: body.next || "/admin" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed." }, { status: 500 });
  }
}
