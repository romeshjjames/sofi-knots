import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const CUSTOMER_ACCESS_COOKIE = "sofi_customer_access_token";
export const CUSTOMER_REFRESH_COOKIE = "sofi_customer_refresh_token";

export type CustomerSession = {
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
  } | null;
  customerId: string | null;
};

export async function syncCustomerProfile(input: {
  email: string;
  fullName: string;
  phone?: string | null;
}) {
  const supabase = createAdminSupabaseClient();
  const normalizedEmail = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  const { data: existingCustomer, error: existingError } = await supabase
    .from("customers")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  if (existingCustomer?.id) {
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        email: normalizedEmail,
        full_name: fullName || null,
        phone: input.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingCustomer.id);

    if (updateError) throw new Error(updateError.message);
    return existingCustomer.id as string;
  }

  const { data: createdCustomer, error: createError } = await supabase
    .from("customers")
    .insert({
      email: normalizedEmail,
      full_name: fullName || null,
      phone: input.phone || null,
    })
    .select("id")
    .single();

  if (createError) throw new Error(createError.message);
  return createdCustomer.id as string;
}

export async function getCustomerSession(): Promise<CustomerSession> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(CUSTOMER_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return { user: null, customerId: null };
  }

  const supabase = createAdminSupabaseClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData.user?.email) {
    return { user: null, customerId: null };
  }

  const fullName =
    (typeof userData.user.user_metadata?.full_name === "string" && userData.user.user_metadata.full_name.trim()) ||
    (typeof userData.user.user_metadata?.name === "string" && userData.user.user_metadata.name.trim()) ||
    userData.user.email.split("@")[0];
  const phone =
    typeof userData.user.user_metadata?.phone === "string" && userData.user.user_metadata.phone.trim()
      ? userData.user.user_metadata.phone.trim()
      : null;

  const customerId = await syncCustomerProfile({
    email: userData.user.email,
    fullName,
    phone,
  }).catch(() => null);

  return {
    user: {
      id: userData.user.id,
      email: userData.user.email,
      fullName,
      phone,
    },
    customerId,
  };
}

export async function requireCustomerPage() {
  const session = await getCustomerSession();
  if (!session.user) {
    redirect("/account/login?next=/account");
  }
  return session;
}
