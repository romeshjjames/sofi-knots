import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { CUSTOMER_ACCESS_COOKIE, CUSTOMER_REFRESH_COOKIE, syncCustomerProfile } from "@/lib/supabase/customer-auth";
import { getCustomerAdminStateByEmail } from "@/lib/customers";

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

    if (error || !data.session || !data.user?.email) {
      return NextResponse.json({ error: error?.message || "Login failed." }, { status: 401 });
    }

    const fullName =
      (typeof data.user.user_metadata?.full_name === "string" && data.user.user_metadata.full_name.trim()) ||
      (typeof data.user.user_metadata?.name === "string" && data.user.user_metadata.name.trim()) ||
      data.user.email.split("@")[0];
    const phone =
      typeof data.user.user_metadata?.phone === "string" && data.user.user_metadata.phone.trim()
        ? data.user.user_metadata.phone.trim()
        : null;

    const customerId = await syncCustomerProfile({
      email: data.user.email,
      fullName,
      phone,
    });

    const adminState = await getCustomerAdminStateByEmail(data.user.email);
    if (adminState.state.isActive === false) {
      return NextResponse.json({ error: "Your account has been deactivated. Please contact support." }, { status: 403 });
    }

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

    return NextResponse.json({ redirectTo: body.next || "/account", customerId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed." }, { status: 500 });
  }
}
