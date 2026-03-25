import { unstable_noStore as noStore } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type AdminOption = {
  id: string;
  name: string;
  slug: string;
};

export async function getAdminCategoryOptions(): Promise<AdminOption[]> {
  noStore();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
  }));
}

export async function getAdminCollectionOptions(): Promise<AdminOption[]> {
  noStore();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
  }));
}
