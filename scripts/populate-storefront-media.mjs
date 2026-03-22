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

const pageUploads = [
  {
    key: "collectionsIntro",
    mediaId: "page-media-collections-intro",
    filePath: resolve(assetRoot, "product-wallart.jpg"),
    storagePath: "media-library/pages/collections/collections-intro.jpg",
    contentType: "image/jpeg",
    alt: "Collections landing image",
    fileName: "collections-intro.jpg",
    category: "Pages",
    tags: ["collections", "landing", "banner"],
  },
  {
    key: "blogIntro",
    mediaId: "page-media-blog-intro",
    filePath: resolve(assetRoot, "product-wallhanging.jpeg"),
    storagePath: "media-library/pages/blog/blog-intro.jpeg",
    contentType: "image/jpeg",
    alt: "Blog landing image",
    fileName: "blog-intro.jpeg",
    category: "Pages",
    tags: ["blog", "landing", "editorial"],
  },
  {
    key: "contactSupport",
    mediaId: "page-media-contact-support",
    filePath: resolve(assetRoot, "product-bag.jpeg"),
    storagePath: "media-library/pages/contact/contact-support.jpeg",
    contentType: "image/jpeg",
    alt: "Contact page support image",
    fileName: "contact-support.jpeg",
    category: "Pages",
    tags: ["contact", "support", "studio"],
  },
  {
    key: "mandalaStory",
    mediaId: "product-story-mandala-wall-art",
    filePath: resolve(assetRoot, "product-wallart.jpg"),
    storagePath: "media-library/products/mandala-wall-art-story.jpg",
    contentType: "image/jpeg",
    alt: "Mandala wall art editorial image",
    fileName: "mandala-wall-art-story.jpg",
    category: "Products",
    tags: ["product", "wall-art", "story"],
  },
  {
    key: "terracottaStory",
    mediaId: "product-story-terracotta-cushion-cover",
    filePath: resolve(assetRoot, "product-pillow.jpeg"),
    storagePath: "media-library/products/terracotta-cushion-cover-story.jpeg",
    contentType: "image/jpeg",
    alt: "Terracotta cushion cover editorial image",
    fileName: "terracotta-cushion-cover-story.jpeg",
    category: "Products",
    tags: ["product", "cushion", "story"],
  },
  {
    key: "bohemianLivingStory",
    mediaId: "collection-story-bohemian-living",
    filePath: resolve(assetRoot, "product-bag.jpeg"),
    storagePath: "media-library/collections/bohemian-living-story.jpeg",
    contentType: "image/jpeg",
    alt: "Bohemian Living collection editorial image",
    fileName: "bohemian-living-story.jpeg",
    category: "Collections",
    tags: ["collection", "bohemian-living", "story"],
  },
  {
    key: "earthTextureStory",
    mediaId: "collection-story-earth-texture",
    filePath: resolve(assetRoot, "product-wallhanging.jpeg"),
    storagePath: "media-library/collections/earth-texture-story.jpeg",
    contentType: "image/jpeg",
    alt: "Earth Texture collection editorial image",
    fileName: "earth-texture-story.jpeg",
    category: "Collections",
    tags: ["collection", "earth-texture", "story"],
  },
];

function extractStoragePath(publicUrl) {
  const marker = "/object/public/product-media/";
  const index = publicUrl.indexOf(marker);
  if (index === -1) return "";
  return publicUrl.slice(index + marker.length);
}

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

async function registerMediaAsset({
  mediaId,
  fileName,
  path,
  publicUrl,
  altText,
  category,
  tags,
}) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: null,
    entity_type: "media_library",
    entity_id: mediaId,
    action: "upload",
    payload: {
      id: mediaId,
      fileName,
      path,
      publicUrl,
      altText,
      category,
      tags,
      mediaType: "image",
    },
  });

  if (error) throw new Error(error.message);
}

function createImageBlock({
  sectionId,
  sectionLabel,
  alt,
  url,
  caption,
  sectionLayout = "banner",
  sectionTheme = "paper",
}) {
  return {
    type: "image",
    url,
    alt,
    caption,
    sectionId,
    sectionLabel,
    sectionTheme,
    sectionLayout,
    sectionSpacing: "airy",
  };
}

function upsertImageBlock(body, nextBlock) {
  const blocks = Array.isArray(body) ? [...body] : [];
  let found = false;

  const mapped = blocks.map((block) => {
    if (block && typeof block === "object" && block.type === "image" && block.sectionId === nextBlock.sectionId) {
      found = true;
      return {
        ...block,
        url: nextBlock.url,
        alt: nextBlock.alt,
        caption: nextBlock.caption,
        sectionTheme: nextBlock.sectionTheme,
        sectionLayout: nextBlock.sectionLayout,
      };
    }
    return block;
  });

  if (!found) mapped.push(nextBlock);
  return mapped;
}

async function updatePage(slug, nextBlock, starterBlocks = []) {
  const { data, error } = await supabase.from("pages").select("id, body").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error(`Page not found for slug: ${slug}`);

  const currentBody = Array.isArray(data.body) && data.body.length ? data.body : starterBlocks;
  const nextBody = upsertImageBlock(currentBody, nextBlock);
  const { error: updateError } = await supabase.from("pages").update({ body: nextBody }).eq("id", data.id);
  if (updateError) throw new Error(updateError.message);
  return data.id;
}

async function getLatestContentBody(entityType, entityId) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("payload")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("action", "content:update")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const body = data?.payload?.body;
  return Array.isArray(body) ? body : [];
}

async function writeCommercePageContent(entityType, entityId, body) {
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: null,
    entity_type: entityType,
    entity_id: entityId,
    action: "content:update",
    payload: { body },
  });
  if (error) throw new Error(error.message);
}

function buildProductStoryStarter(name, description) {
  return [
    {
      type: "heading",
      content: `${name} story`,
      level: "h2",
      sectionId: "product-story",
      sectionLabel: "Product story",
      sectionTheme: "paper",
      sectionLayout: "split",
      sectionSpacing: "airy",
    },
    {
      type: "paragraph",
      content: description || `Use this section to describe the making process, styling notes, and artisan details behind ${name}.`,
      sectionId: "product-story",
      sectionLabel: "Product story",
      sectionTheme: "paper",
      sectionLayout: "split",
      sectionSpacing: "airy",
    },
  ];
}

function buildCollectionStoryStarter(title, description) {
  return [
    {
      type: "heading",
      content: `${title} collection story`,
      level: "h2",
      sectionId: "collection-story",
      sectionLabel: "Collection story",
      sectionTheme: "paper",
      sectionLayout: "split",
      sectionSpacing: "airy",
    },
    {
      type: "paragraph",
      content: description || `Use this section to describe the mood, materials, and styling point of view behind ${title}.`,
      sectionId: "collection-story",
      sectionLabel: "Collection story",
      sectionTheme: "paper",
      sectionLayout: "split",
      sectionSpacing: "airy",
    },
  ];
}

async function updateProductStory(slug, publicUrl, altText) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) return null;

  const currentBody = await getLatestContentBody("product_page_content", data.id);
  const nextBody = upsertImageBlock(
    currentBody.length ? currentBody : buildProductStoryStarter(data.name, data.description),
    createImageBlock({
      sectionId: "product-story",
      sectionLabel: "Product story",
      alt: altText,
      url: publicUrl,
      caption: "Media Library image",
      sectionLayout: "split",
    }),
  );

  await writeCommercePageContent("product_page_content", data.id, nextBody);
  return data.id;
}

async function updateCollectionStory(slug, publicUrl, altText) {
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, description")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) return null;

  const currentBody = await getLatestContentBody("collection_page_content", data.id);
  const nextBody = upsertImageBlock(
    currentBody.length ? currentBody : buildCollectionStoryStarter(data.name, data.description),
    createImageBlock({
      sectionId: "collection-story",
      sectionLabel: "Collection story",
      alt: altText,
      url: publicUrl,
      caption: "Media Library image",
      sectionLayout: "split",
    }),
  );

  await writeCommercePageContent("collection_page_content", data.id, nextBody);
  return data.id;
}

async function ensureMediaFromExistingUrl({ mediaId, fileName, publicUrl, altText, category, tags }) {
  const path = extractStoragePath(publicUrl);
  await registerMediaAsset({
    mediaId,
    fileName,
    path,
    publicUrl,
    altText,
    category,
    tags,
  });
  return publicUrl;
}

const uploaded = {};
for (const entry of pageUploads) {
  uploaded[entry.key] = await uploadAsset(entry);
  await registerMediaAsset({
    mediaId: entry.mediaId,
    fileName: entry.fileName,
    path: entry.storagePath,
    publicUrl: uploaded[entry.key],
    altText: entry.alt,
    category: entry.category,
    tags: entry.tags,
  });
}

const pageUpdates = {
  collections: await updatePage(
    "collections",
    createImageBlock({
      sectionId: "collections-intro",
      sectionLabel: "Collections intro",
      alt: "Collections landing image",
      url: uploaded.collectionsIntro,
      caption: "Optional collections landing image",
      sectionLayout: "banner",
    }),
  ),
  blog: await updatePage(
    "blog",
    createImageBlock({
      sectionId: "blog-intro",
      sectionLabel: "Blog intro",
      alt: "Blog landing image",
      url: uploaded.blogIntro,
      caption: "Optional blog banner image",
      sectionLayout: "banner",
    }),
  ),
  contact: await updatePage(
    "contact",
    createImageBlock({
      sectionId: "contact-support",
      sectionLabel: "Support details",
      alt: "Contact page support image",
      url: uploaded.contactSupport,
      caption: "Optional support or studio image",
      sectionLayout: "split",
    }),
  ),
};

const { data: rainbowProduct, error: rainbowError } = await supabase
  .from("products")
  .select("id, slug, name, featured_image_url")
  .eq("slug", "rainbow-bloom-macrame-sling-bag")
  .maybeSingle();
if (rainbowError) throw new Error(rainbowError.message);

let rainbowUrl = rainbowProduct?.featured_image_url ?? null;
if (rainbowUrl) {
  rainbowUrl = await ensureMediaFromExistingUrl({
    mediaId: "product-story-rainbow-bloom-macrame-sling-bag",
    fileName: "rainbow-bloom-macrame-sling-bag-story",
    publicUrl: rainbowUrl,
    altText: "Rainbow Bloom Macrame Sling Bag editorial image",
    category: "Products",
    tags: ["product", "rainbow-bloom", "story"],
  });
}

const productUpdates = {
  rainbowBloom: rainbowUrl
    ? await updateProductStory("rainbow-bloom-macrame-sling-bag", rainbowUrl, "Rainbow Bloom Macrame Sling Bag editorial image")
    : null,
  mandalaWallArt: await updateProductStory("mandala-wall-art", uploaded.mandalaStory, "Mandala Wall Art editorial image"),
  terracottaCushion: await updateProductStory("terracotta-cushion-cover", uploaded.terracottaStory, "Terracotta Cushion Cover editorial image"),
};

const collectionUpdates = {
  bohemianLiving: await updateCollectionStory("bohemian-living", uploaded.bohemianLivingStory, "Bohemian Living collection editorial image"),
  earthTexture: await updateCollectionStory("earth-texture", uploaded.earthTextureStory, "Earth Texture collection editorial image"),
};

console.log("Updated pages:", pageUpdates);
console.log("Updated product stories:", productUpdates);
console.log("Updated collection stories:", collectionUpdates);
console.log("Uploaded storefront media:", uploaded);
