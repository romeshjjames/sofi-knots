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

const bucket = "product-media";
const assetRoot = resolve(process.cwd(), "src", "assets");

const uploads = [
  {
    key: "homeHero",
    filePath: resolve(assetRoot, "hero-bg.jpg"),
    storagePath: "media-library/pages/home/home-hero.jpg",
    contentType: "image/jpeg",
    alt: "Sofi Knots homepage hero",
  },
  {
    key: "homeCraft",
    filePath: resolve(assetRoot, "product-wallhanging.jpeg"),
    storagePath: "media-library/pages/home/home-craft.jpeg",
    contentType: "image/jpeg",
    alt: "Sofi Knots craft section image",
  },
  {
    key: "aboutHero",
    filePath: resolve(assetRoot, "product-wallart.jpg"),
    storagePath: "media-library/pages/about/about-hero.jpg",
    contentType: "image/jpeg",
    alt: "Sofi Knots about hero image",
  },
  {
    key: "aboutValues",
    filePath: resolve(assetRoot, "product-wallhanging.jpeg"),
    storagePath: "media-library/pages/about/about-values.jpeg",
    contentType: "image/jpeg",
    alt: "Sofi Knots craftsmanship image",
  },
  {
    key: "aboutFounder",
    filePath: resolve(assetRoot, "product-bag.jpeg"),
    storagePath: "media-library/pages/about/about-founder.jpeg",
    contentType: "image/jpeg",
    alt: "Sofi Knots founder note image",
  },
];

async function uploadAsset(input) {
  const bytes = readFileSync(input.filePath);
  const { error } = await supabase.storage.from(bucket).upload(input.storagePath, bytes, {
    contentType: input.contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(input.storagePath);
  return data.publicUrl;
}

function updateImageBlock(body, sectionId, nextUrl, nextAlt) {
  return (Array.isArray(body) ? body : []).map((block) => {
    if (block && typeof block === "object" && block.type === "image" && block.sectionId === sectionId) {
      return {
        ...block,
        url: nextUrl,
        alt: nextAlt,
      };
    }
    return block;
  });
}

async function updatePage(slug, updater) {
  const { data, error } = await supabase
    .from("pages")
    .select("id, body")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error(`Page not found for slug: ${slug}`);

  const nextBody = updater(data.body);

  const { error: updateError } = await supabase
    .from("pages")
    .update({ body: nextBody })
    .eq("id", data.id);

  if (updateError) throw new Error(updateError.message);
  return data.id;
}

const uploaded = {};
for (const entry of uploads) {
  uploaded[entry.key] = await uploadAsset(entry);
}

const homePageId = await updatePage("home", (body) => {
  let next = updateImageBlock(body, "home-hero", uploaded.homeHero, "Sofi Knots homepage hero");
  next = updateImageBlock(next, "home-values", uploaded.homeCraft, "Sofi Knots craft section image");
  return next;
});

const aboutPageId = await updatePage("about", (body) => {
  let next = updateImageBlock(body, "about-story", uploaded.aboutHero, "Sofi Knots about hero image");
  next = updateImageBlock(next, "about-values", uploaded.aboutValues, "Sofi Knots craftsmanship image");
  next = updateImageBlock(next, "about-founder", uploaded.aboutFounder, "Sofi Knots founder note image");
  return next;
});

console.log(`Updated home page media: ${homePageId}`);
console.log(`Updated about page media: ${aboutPageId}`);
console.log(uploaded);
