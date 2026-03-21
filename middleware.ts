import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_COOKIE } from "@/lib/supabase/auth";

const PROTECTED_PATHS = ["/admin", "/api/admin"];
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login", "/api/admin/logout"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtected || isPublicAdminPath) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
