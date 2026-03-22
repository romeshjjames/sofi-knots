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

const envPath = resolve(process.cwd(), ".env.local");
loadEnv(envPath);

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

const homeBody = [
  {
    type: "heading",
    content: "Where Every Knot Tells a Story",
    level: "h2",
    sectionId: "home-hero",
    sectionLabel: "Handcrafted with intention",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Artisan macrame pieces crafted from organic cotton for the spaces and moments you cherish most.",
    sectionId: "home-hero",
    sectionLabel: "Handcrafted with intention",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Shop Now",
    href: "/shop",
    style: "primary",
    sectionId: "home-hero",
    sectionLabel: "Handcrafted with intention",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Explore Collections",
    href: "/collections",
    style: "secondary",
    sectionId: "home-hero",
    sectionLabel: "Handcrafted with intention",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Trust strip",
    level: "h2",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "paragraph",
    content: "Use H3 blocks below for each trust item shown beneath the hero.",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "heading",
    content: "Free Shipping Over 375",
    level: "h3",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "paragraph",
    content: "Fast, reliable delivery for thoughtfully crafted pieces.",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "heading",
    content: "Artisan Guarantee",
    level: "h3",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "paragraph",
    content: "Handmade quality shaped with patience, care, and premium finishing.",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "heading",
    content: "Organic Materials",
    level: "h3",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "paragraph",
    content: "Soft fibers and natural textures selected for beauty and longevity.",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "heading",
    content: "4.9 Customer Rating",
    level: "h3",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "paragraph",
    content: "A trusted favorite for gifting, styling, and meaningful keepsakes.",
    sectionId: "home-intro",
    sectionLabel: "Trust strip",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "compact",
  },
  {
    type: "heading",
    content: "Our Collections",
    level: "h2",
    sectionId: "home-collections",
    sectionLabel: "Curated for you",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Curated edits of woven bags, statement wall hangings, jewelry, and finishing accents designed to bring warmth, texture, and handmade character into everyday living.",
    sectionId: "home-collections",
    sectionLabel: "Curated for you",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Best Sellers",
    level: "h2",
    sectionId: "home-featured",
    sectionLabel: "Most loved",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Showcase the pieces customers come back to most, from signature bags to soft home accents and handcrafted details.",
    sectionId: "home-featured",
    sectionLabel: "Most loved",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Made by Hand, Made with Heart",
    level: "h2",
    sectionId: "home-values",
    sectionLabel: "Our craft",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Every Sofi Knots piece begins with a single strand of organic cotton and hours of meditative knotting. Our artisans bring decades of intuitive expertise to each creation, blending traditional macrame techniques with a contemporary design language.",
    sectionId: "home-values",
    sectionLabel: "Our craft",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "image",
    url: "",
    alt: "Craft image",
    caption: "Optional craft image",
    sectionId: "home-values",
    sectionLabel: "Our craft",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Our Story",
    href: "/about",
    style: "secondary",
    sectionId: "home-values",
    sectionLabel: "Our craft",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "What Our Customers Say",
    level: "h2",
    sectionId: "home-testimonials",
    sectionLabel: "Kind words",
    sectionTheme: "ink",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Approved featured reviews from the Reviews admin appear in this section automatically.",
    sectionId: "home-testimonials",
    sectionLabel: "Kind words",
    sectionTheme: "ink",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Join Our Circle",
    level: "h2",
    sectionId: "home-newsletter",
    sectionLabel: "Stay connected",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Be the first to know about new collections, artisan stories, and exclusive offers.",
    sectionId: "home-newsletter",
    sectionLabel: "Stay connected",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Subscribe",
    href: "#",
    style: "primary",
    sectionId: "home-newsletter",
    sectionLabel: "Stay connected",
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
];

const homePageRecord = {
  title: "Sofi Knots Home",
  slug: "home",
  excerpt: "Control the premium homepage hero, trust strip, collections intro, bestseller story, craft section, testimonials, and newsletter from this page.",
  body: homeBody,
  status: "published",
  seo_title: "Sofi Knots | Handmade Macrame Decor, Bags and Artisan Accessories",
  seo_description: "Luxury handcrafted macrame bags, decor, and custom pieces from Sofi Knots.",
  seo_keywords: ["handmade macrame", "sofi knots", "artisan home decor", "macrame bags"],
  canonical_url: "/",
};

const { data: existing, error: existingError } = await supabase
  .from("pages")
  .select("id")
  .eq("slug", "home")
  .maybeSingle();

if (existingError) {
  throw new Error(existingError.message);
}

if (existing?.id) {
  const { error } = await supabase.from("pages").update(homePageRecord).eq("id", existing.id);
  if (error) throw new Error(error.message);
  console.log(`Updated existing home page: ${existing.id}`);
} else {
  const { data, error } = await supabase.from("pages").insert(homePageRecord).select("id").single();
  if (error) throw new Error(error.message);
  console.log(`Inserted new home page: ${data.id}`);
}
