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

const aboutBody = [
  {
    type: "heading",
    content: "Woven with patience, warmth, and purpose",
    level: "h2",
    sectionId: "about-story",
    sectionLabel: "Brand story",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Sofi Knots is a slow craft studio creating handmade macrame pieces that bring softness, warmth, and meaning into modern homes and memorable gifting moments.",
    sectionId: "about-story",
    sectionLabel: "Brand story",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "image",
    url: "",
    alt: "About hero image",
    caption: "Optional about hero image",
    sectionId: "about-story",
    sectionLabel: "Brand story",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Explore Collections",
    href: "/collections",
    style: "secondary",
    sectionId: "about-story",
    sectionLabel: "Brand story",
    sectionTheme: "paper",
    sectionLayout: "banner",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Crafted with intention",
    level: "h2",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Every piece begins with patient handwork, premium fibers, and a quiet attention to detail that makes each creation feel personal, giftable, and made to last.",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "image",
    url: "",
    alt: "Craft values image",
    caption: "Optional craft image",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Organic materials",
    level: "h3",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Natural fibers and premium finishes chosen for softness, beauty, and longevity.",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Handmade finish",
    level: "h3",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Each piece is shaped slowly by hand so texture, symmetry, and detail feel intentional.",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Designed to last",
    level: "h3",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Modern heirloom pieces made for thoughtful gifting and long-term everyday use.",
    sectionId: "about-values",
    sectionLabel: "Craft values",
    sectionTheme: "sand",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "A studio rooted in slow craft",
    level: "h2",
    sectionId: "about-founder",
    sectionLabel: "Founder note",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Use this section to share the deeper studio perspective behind Sofi Knots, your making process, and the point of view that shapes every collection.",
    sectionId: "about-founder",
    sectionLabel: "Founder note",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "image",
    url: "",
    alt: "Founder or studio image",
    caption: "Optional founder image",
    sectionId: "about-founder",
    sectionLabel: "Founder note",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "quote",
    quote: "Handmade work should feel both artful and livable, carrying the softness of craft into everyday spaces.",
    cite: "Sofi Knots studio note",
    sectionId: "about-founder",
    sectionLabel: "Founder note",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Contact Us",
    href: "/contact",
    style: "secondary",
    sectionId: "about-founder",
    sectionLabel: "Founder note",
    sectionTheme: "paper",
    sectionLayout: "split",
    sectionSpacing: "airy",
  },
  {
    type: "heading",
    content: "Bring Sofi Knots into your story",
    level: "h2",
    sectionId: "about-cta",
    sectionLabel: "Brand call to action",
    sectionTheme: "ink",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "paragraph",
    content: "Explore our collections, discover handmade pieces for meaningful gifting, or get in touch for a custom creation shaped around your story.",
    sectionId: "about-cta",
    sectionLabel: "Brand call to action",
    sectionTheme: "ink",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Shop All",
    href: "/shop",
    style: "primary",
    sectionId: "about-cta",
    sectionLabel: "Brand call to action",
    sectionTheme: "ink",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
  {
    type: "cta",
    label: "Contact Us",
    href: "/contact",
    style: "secondary",
    sectionId: "about-cta",
    sectionLabel: "Brand call to action",
    sectionTheme: "ink",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  },
];

const aboutPageRecord = {
  title: "About Sofi Knots",
  slug: "about",
  excerpt: "Tell the brand story, craft values, founder note, and warm closing invitation from one editable premium About page.",
  body: aboutBody,
  status: "published",
  seo_title: "About Sofi Knots",
  seo_description: "Learn the story behind Sofi Knots and the handcrafted approach shaping every macrame piece.",
  seo_keywords: ["about sofi knots", "handmade brand story", "macrame artisan brand"],
  canonical_url: "/about",
};

const { data: existing, error: existingError } = await supabase
  .from("pages")
  .select("id")
  .eq("slug", "about")
  .maybeSingle();

if (existingError) throw new Error(existingError.message);

if (existing?.id) {
  const { error } = await supabase.from("pages").update(aboutPageRecord).eq("id", existing.id);
  if (error) throw new Error(error.message);
  console.log(`Updated existing about page: ${existing.id}`);
} else {
  const { data, error } = await supabase.from("pages").insert(aboutPageRecord).select("id").single();
  if (error) throw new Error(error.message);
  console.log(`Inserted new about page: ${data.id}`);
}
