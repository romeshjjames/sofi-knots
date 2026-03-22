import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(filePath) {
  const source = readFileSync(filePath, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv(resolve(process.cwd(), ".env.local"));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const collectionSlugs = ["bohemian-living", "earth-texture"];

async function getLatestCollectionBody(collectionId) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("payload")
    .eq("entity_type", "collection_page_content")
    .eq("entity_id", collectionId)
    .eq("action", "content:update")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const body = data?.payload?.body;
  return Array.isArray(body) ? body : [];
}

for (const slug of collectionSlugs) {
  const { data: collection, error: collectionError } = await supabase
    .from("collections")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (collectionError) throw new Error(collectionError.message);
  if (!collection?.id) continue;

  const currentBody = await getLatestCollectionBody(collection.id);
  const nextBody = currentBody.filter(
    (block) => !(block && typeof block === "object" && block.type === "image" && block.sectionId === "collection-story"),
  );

  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: null,
    entity_type: "collection_page_content",
    entity_id: collection.id,
    action: "content:update",
    payload: { body: nextBody },
  });

  if (error) throw new Error(error.message);
  console.log(`Cleared collection story image for ${slug} (${collection.id})`);
}
