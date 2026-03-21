import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const ADMIN_ACCESS_COOKIE = "sofi_admin_access_token";
export const ADMIN_REFRESH_COOKIE = "sofi_admin_refresh_token";

export type AdminRole =
  | "super_admin"
  | "content_admin"
  | "catalog_admin"
  | "order_admin"
  | "marketing_admin";

export async function getAdminSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return { user: null, roles: [] as AdminRole[] };
  }

  const supabase = createAdminSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) {
    return { user: null, roles: [] as AdminRole[] };
  }

  const { data: rolesData } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", userData.user.id);

  const roles = (rolesData ?? []).map((item) => item.role as AdminRole);
  return { user: userData.user, roles };
}

export async function requireAdminPage(allowedRoles?: AdminRole[]) {
  const session = await getAdminSession();

  if (!session.user) {
    redirect("/admin/login");
  }

  if (allowedRoles?.length && !session.roles.some((role) => allowedRoles.includes(role))) {
    redirect("/admin/login?error=forbidden");
  }

  if (!session.roles.length) {
    redirect("/admin/login?error=no-role");
  }

  return session;
}

export async function requireAdminApi(allowedRoles?: AdminRole[]) {
  const session = await getAdminSession();

  if (!session.user) {
    return { ok: false as const, status: 401, error: "Authentication required." };
  }

  if (!session.roles.length) {
    return { ok: false as const, status: 403, error: "No admin role assigned." };
  }

  if (allowedRoles?.length && !session.roles.some((role) => allowedRoles.includes(role))) {
    return { ok: false as const, status: 403, error: "Insufficient permissions." };
  }

  return { ok: true as const, session };
}
