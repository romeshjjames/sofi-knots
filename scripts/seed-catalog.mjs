import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filename) {
  const envPath = path.join(projectRoot, filename);
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in local environment.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const categories = [
  {
    name: "Bags",
    slug: "bags",
    description: "Handcrafted macrame bags for everyday style and gifting.",
    seo_title: "Handmade Macrame Bags | Sofi Knots",
    seo_description: "Shop handcrafted macrame bags by Sofi Knots for boho styling, gifting, and everyday artisan fashion.",
    seo_keywords: ["macrame bags", "handmade bags india", "boho tote bag"],
    sort_order: 1,
  },
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Soft artisan decor pieces designed for warm and soulful interiors.",
    seo_title: "Macrame Home Decor | Sofi Knots",
    seo_description: "Discover handcrafted macrame home decor by Sofi Knots for warm, layered, and elegant interiors.",
    seo_keywords: ["macrame home decor", "boho decor india", "artisan home accents"],
    sort_order: 2,
  },
  {
    name: "Wall Art",
    slug: "wall-art",
    description: "Statement wall hangings and handcrafted macrame art pieces.",
    seo_title: "Macrame Wall Art | Sofi Knots",
    seo_description: "Explore handmade macrame wall art by Sofi Knots for bohemian and contemporary homes.",
    seo_keywords: ["macrame wall art", "wall hanging india", "boho wall decor"],
    sort_order: 3,
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Small handcrafted accents for everyday use and easy gifting.",
    seo_title: "Macrame Accessories | Sofi Knots",
    seo_description: "Browse handmade macrame accessories by Sofi Knots including keychains, charms, holders, and gifting pieces.",
    seo_keywords: ["macrame accessories", "handmade accessories india", "artisan gift ideas"],
    sort_order: 4,
  },
  {
    name: "Baby Collection",
    slug: "baby-collection",
    description: "Gentle handcrafted keepsakes and gifting favorites for little ones.",
    seo_title: "Baby Collection | Sofi Knots",
    seo_description: "Shop the Sofi Knots baby collection with handcrafted macrame gifting pieces and keepsakes.",
    seo_keywords: ["baby collection handmade", "baby gift india", "artisan keepsakes"],
    sort_order: 5,
  },
];

const collections = [
  {
    name: "Bohemian Living",
    slug: "bohemian-living",
    description: "Statement pieces for soulful homes and layered spaces.",
    seo_title: "Bohemian Living Collection | Sofi Knots",
    seo_description: "Explore the Bohemian Living collection featuring handcrafted macrame decor and accessories by Sofi Knots.",
    seo_keywords: ["bohemian collection", "macrame collection", "boho decor india"],
    sort_order: 1,
  },
  {
    name: "Earth & Texture",
    slug: "earth-texture",
    description: "Warm neutral craftsmanship inspired by earthy tones.",
    seo_title: "Earth and Texture Collection | Sofi Knots",
    seo_description: "Discover the Earth and Texture collection for handcrafted decor and accessories in warm artisan tones.",
    seo_keywords: ["earthy decor", "neutral macrame collection", "artisan home styling"],
    sort_order: 2,
  },
  {
    name: "Minimalist Knots",
    slug: "minimalist-knots",
    description: "Refined forms with soft handcrafted structure and calm texture.",
    seo_title: "Minimalist Knots Collection | Sofi Knots",
    seo_description: "Shop Minimalist Knots for understated handcrafted macrame pieces with elegant texture and balance.",
    seo_keywords: ["minimalist macrame", "neutral wall decor", "minimal artisan collection"],
    sort_order: 3,
  },
  {
    name: "Everyday Essentials",
    slug: "everyday-essentials",
    description: "Useful handcrafted products designed for daily life and gifting.",
    seo_title: "Everyday Essentials Collection | Sofi Knots",
    seo_description: "Browse Everyday Essentials by Sofi Knots for practical handcrafted accessories and small gifts.",
    seo_keywords: ["everyday accessories", "artisan essentials", "small handmade gifts"],
    sort_order: 4,
  },
  {
    name: "Little Knots",
    slug: "little-knots",
    description: "Tiny treasures, gifting favorites, and baby keepsakes.",
    seo_title: "Little Knots Collection | Sofi Knots",
    seo_description: "Explore Little Knots for handmade baby pieces, keepsakes, and gifting favorites from Sofi Knots.",
    seo_keywords: ["little knots", "baby keepsakes", "handmade gifts india"],
    sort_order: 5,
  },
];

const products = [
  {
    slug: "bohemian-tote-bag",
    name: "Bohemian Tote Bag",
    category_slug: "bags",
    collection_slug: "bohemian-living",
    short_description: "A handcrafted macrame tote with bold bohemian detailing.",
    description: "Hand-knotted macrame tote with vibrant geometric patterns. Perfect for beach days, gifting, and everyday artisan styling.",
    price_inr: 2450,
    compare_at_price_inr: 2950,
    badge: "Bestseller",
    rating: 4.8,
    status: "active",
    is_featured: true,
    seo_title: "Bohemian Tote Bag | Handmade Macrame Tote by Sofi Knots",
    seo_description: "Shop the Bohemian Tote Bag by Sofi Knots, a handcrafted macrame tote made with premium cotton cord for chic everyday styling.",
    seo_keywords: ["bohemian tote bag", "handmade macrame bag", "macrame tote india"],
  },
  {
    slug: "terracotta-cushion-cover",
    name: "Terracotta Cushion Cover",
    category_slug: "home-decor",
    collection_slug: "earth-texture",
    short_description: "Warm terracotta texture for cozy handcrafted interiors.",
    description: "Rustic macrame cushion cover with tassels in warm terracotta tones. Adds artisan charm and texture to modern and boho homes.",
    price_inr: 1650,
    compare_at_price_inr: null,
    badge: "New",
    rating: 4.9,
    status: "active",
    is_featured: true,
    seo_title: "Terracotta Cushion Cover | Handmade Macrame Home Decor",
    seo_description: "Discover a handcrafted terracotta macrame cushion cover from Sofi Knots, designed to bring warmth and artisan style to your home.",
    seo_keywords: ["macrame cushion cover", "terracotta home decor", "boho cushion india"],
  },
  {
    slug: "natural-wall-hanging",
    name: "Natural Wall Hanging",
    category_slug: "wall-art",
    collection_slug: "minimalist-knots",
    short_description: "A soft neutral macrame wall accent for serene spaces.",
    description: "Delicate macrame wall hanging in natural cotton. Brings softness, depth, and handmade warmth to your walls.",
    price_inr: 1850,
    compare_at_price_inr: null,
    badge: null,
    rating: 4.7,
    status: "active",
    is_featured: false,
    seo_title: "Natural Wall Hanging | Handmade Macrame Wall Decor",
    seo_description: "Buy a natural cotton macrame wall hanging from Sofi Knots for elegant handcrafted wall decor with a minimalist boho feel.",
    seo_keywords: ["macrame wall hanging", "wall decor handmade", "boho wall art india"],
  },
  {
    slug: "bottle-holder-net",
    name: "Bottle Holder Net",
    category_slug: "accessories",
    collection_slug: "everyday-essentials",
    short_description: "An eco-friendly handcrafted bottle carry essential.",
    description: "Practical macrame bottle holder for your on-the-go lifestyle. Lightweight, reusable, and handcrafted for daily use.",
    price_inr: 450,
    compare_at_price_inr: null,
    badge: null,
    rating: 4.6,
    status: "active",
    is_featured: false,
    seo_title: "Bottle Holder Net | Handmade Macrame Bottle Carrier",
    seo_description: "Carry your bottle in style with a handcrafted macrame bottle holder net by Sofi Knots, designed for everyday convenience.",
    seo_keywords: ["macrame bottle holder", "bottle net bag", "handmade accessories india"],
  },
  {
    slug: "mandala-wall-art",
    name: "Mandala Wall Art",
    category_slug: "wall-art",
    collection_slug: "bohemian-living",
    short_description: "A large handcrafted statement piece for bohemian homes.",
    description: "Large mandala wall art with intricate knotwork and golden tassels. A statement piece for elevated artisan interiors.",
    price_inr: 3200,
    compare_at_price_inr: null,
    badge: "Bestseller",
    rating: 5,
    status: "active",
    is_featured: true,
    seo_title: "Mandala Wall Art | Statement Macrame Wall Decor",
    seo_description: "Explore Sofi Knots mandala wall art, a premium handcrafted macrame statement piece for bohemian and contemporary interiors.",
    seo_keywords: ["mandala wall art", "macrame statement decor", "boho wall decor india"],
  },
  {
    slug: "mini-car-charm",
    name: "Mini Car Charm",
    category_slug: "accessories",
    collection_slug: "everyday-essentials",
    short_description: "A delicate mirror charm for soulful drives.",
    description: "Adorable mini macrame charm for your car mirror. Handmade with love and designed to add softness to everyday travel.",
    price_inr: 350,
    compare_at_price_inr: null,
    badge: null,
    rating: 4.5,
    status: "active",
    is_featured: false,
    seo_title: "Mini Car Charm | Handmade Macrame Car Accessory",
    seo_description: "Add a handcrafted touch to your car with the Sofi Knots mini macrame car charm, designed for thoughtful gifting and styling.",
    seo_keywords: ["macrame car charm", "car mirror hanging handmade", "small macrame accessory"],
  },
  {
    slug: "baby-fringe-dress",
    name: "Baby Fringe Dress",
    category_slug: "baby-collection",
    collection_slug: "little-knots",
    short_description: "A handcrafted baby outfit with signature fringe detailing.",
    description: "Handmade macrame baby dress with tassel details and matching headband. A memorable choice for special gifting.",
    price_inr: 1950,
    compare_at_price_inr: null,
    badge: "New",
    rating: 4.9,
    status: "active",
    is_featured: true,
    seo_title: "Baby Fringe Dress | Handmade Macrame Baby Gift",
    seo_description: "Shop a handcrafted macrame baby fringe dress by Sofi Knots, a unique artisan piece for baby showers and milestone gifting.",
    seo_keywords: ["macrame baby dress", "handmade baby gift", "baby fringe dress india"],
  },
  {
    slug: "daisy-keychain",
    name: "Daisy Keychain",
    category_slug: "accessories",
    collection_slug: "everyday-essentials",
    short_description: "A colorful handmade accessory for gifting and everyday use.",
    description: "Charming floral macrame keychain with playful color accents. A perfect handcrafted add-on gift.",
    price_inr: 280,
    compare_at_price_inr: null,
    badge: null,
    rating: 4.7,
    status: "active",
    is_featured: false,
    seo_title: "Daisy Keychain | Handmade Macrame Keychain",
    seo_description: "Buy the Sofi Knots daisy keychain, a floral handcrafted macrame accessory perfect for gifting and everyday style.",
    seo_keywords: ["macrame keychain", "floral keychain handmade", "small gift ideas india"],
  },
  {
    slug: "floral-headband",
    name: "Floral Headband",
    category_slug: "accessories",
    collection_slug: "little-knots",
    short_description: "A lightweight handcrafted floral headband.",
    description: "Soft macrame headband with delicate pink flower details. Comfortable, lightweight, and perfect for festive looks.",
    price_inr: 550,
    compare_at_price_inr: null,
    badge: null,
    rating: 4.8,
    status: "active",
    is_featured: false,
    seo_title: "Floral Headband | Handmade Macrame Headband",
    seo_description: "Discover a soft handcrafted macrame floral headband by Sofi Knots, perfect for gifting and styling special occasions.",
    seo_keywords: ["macrame headband", "handmade floral headband", "artisan hair accessory"],
  },
];

async function upsertCategories() {
  const { data, error } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select("id, slug");

  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.slug, row.id]));
}

async function upsertCollections() {
  const { data, error } = await supabase
    .from("collections")
    .upsert(collections, { onConflict: "slug" })
    .select("id, slug");

  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.slug, row.id]));
}

async function upsertProducts(categoryMap, collectionMap) {
  const payload = products.map((product) => ({
    category_id: categoryMap.get(product.category_slug) ?? null,
    collection_id: collectionMap.get(product.collection_slug) ?? null,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description,
    price_inr: product.price_inr,
    compare_at_price_inr: product.compare_at_price_inr,
    badge: product.badge,
    rating: product.rating,
    status: product.status,
    is_featured: product.is_featured,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    seo_keywords: product.seo_keywords,
  }));

  const { error } = await supabase.from("products").upsert(payload, { onConflict: "slug" });
  if (error) throw error;
}

async function main() {
  const categoryMap = await upsertCategories();
  const collectionMap = await upsertCollections();
  await upsertProducts(categoryMap, collectionMap);
  console.log("Catalog seed completed successfully.");
}

main().catch((error) => {
  console.error("Catalog seed failed:", error.message);
  process.exitCode = 1;
});
