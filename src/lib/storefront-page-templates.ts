import type { VisualContentBlock } from "@/lib/cms-blocks";
import type { SiteSettingsRecord } from "@/lib/admin-data";

export type CoreStorefrontPageSlug =
  | "home"
  | "shop"
  | "collections"
  | "blog"
  | "about"
  | "contact"
  | "faq"
  | "privacy"
  | "shipping"
  | "terms";

export type CoreStorefrontPageDefinition = {
  slug: CoreStorefrontPageSlug;
  route: string;
  label: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  canonicalUrl: string;
  body: VisualContentBlock[];
};

type SettingsLike = Pick<
  SiteSettingsRecord,
  "siteName" | "storeDescription" | "supportEmail" | "supportPhone" | "contactPageMessage" | "shipping" | "policies"
>;

function sectionHeading(content: string, sectionId: string, label: string, level: "h2" | "h3" = "h2"): VisualContentBlock {
  return {
    type: "heading",
    content,
    level,
    sectionId,
    sectionLabel: label,
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  };
}

function sectionParagraph(content: string, sectionId: string, label: string): VisualContentBlock {
  return {
    type: "paragraph",
    content,
    sectionId,
    sectionLabel: label,
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  };
}

function sectionCta(labelText: string, href: string, sectionId: string, label: string): VisualContentBlock {
  return {
    type: "cta",
    label: labelText,
    href,
    style: "primary",
    sectionId,
    sectionLabel: label,
    sectionTheme: "paper",
    sectionLayout: "stacked",
    sectionSpacing: "airy",
  };
}

export const coreStorefrontRoutes: { slug: CoreStorefrontPageSlug; route: string; label: string }[] = [
  { slug: "home", route: "/", label: "Homepage" },
  { slug: "shop", route: "/shop", label: "Shop landing" },
  { slug: "collections", route: "/collections", label: "Collections landing" },
  { slug: "blog", route: "/blog", label: "Blog landing" },
  { slug: "about", route: "/about", label: "About page" },
  { slug: "contact", route: "/contact", label: "Contact page" },
  { slug: "faq", route: "/faq", label: "FAQ page" },
  { slug: "privacy", route: "/privacy", label: "Privacy policy" },
  { slug: "shipping", route: "/shipping", label: "Shipping & returns" },
  { slug: "terms", route: "/terms", label: "Terms & conditions" },
];

export function isCoreStorefrontPageSlug(slug: string): slug is CoreStorefrontPageSlug {
  return coreStorefrontRoutes.some((item) => item.slug === slug);
}

export function buildCoreStorefrontPages(settings: SettingsLike): CoreStorefrontPageDefinition[] {
  const siteName = settings.siteName || "Sofi Knots";
  const siteDescription =
    settings.storeDescription || "Luxury handcrafted macrame bags, decor, and custom pieces from Sofi Knots.";
  const supportEmail = settings.supportEmail || "hello@sofiknots.com";
  const supportPhone = settings.supportPhone || "+91 98765 43210";
  const contactMessage =
    settings.contactPageMessage ||
    "We usually reply within 24 hours for gifting requests, custom orders, and product questions.";

  return [
    {
      slug: "home",
      route: "/",
      label: "Homepage",
      title: `${siteName} Home`,
      excerpt: "Control the premium homepage hero, trust strip, collections intro, bestseller story, craft section, testimonials, and newsletter from this page.",
      seoTitle: `${siteName} | Handmade Macrame Decor, Bags and Artisan Accessories`,
      seoDescription: siteDescription,
      seoKeywords: ["handmade macrame", siteName.toLowerCase(), "artisan home decor", "macrame bags"],
      canonicalUrl: "/",
      body: [
        sectionHeading("Where Every Knot Tells a Story", "home-hero", "Handcrafted with intention"),
        sectionParagraph(
          "Artisan macrame pieces crafted from organic cotton for the spaces and moments you cherish most.",
          "home-hero",
          "Handcrafted with intention",
        ),
        {
          type: "image",
          url: "",
          alt: "Homepage hero image",
          caption: "Optional hero image",
          sectionId: "home-hero",
          sectionLabel: "Handcrafted with intention",
          sectionTheme: "paper",
          sectionLayout: "banner",
          sectionSpacing: "airy",
        },
        sectionCta("Shop Now", "/shop", "home-hero", "Handcrafted with intention"),
        sectionCta("Explore Collections", "/collections", "home-hero", "Handcrafted with intention"),
        sectionHeading("Trust strip", "home-intro", "Trust strip"),
        sectionParagraph(
          "Use H3 blocks below for each trust item shown beneath the hero.",
          "home-intro",
          "Trust strip",
        ),
        sectionHeading("Free Shipping Over 375", "home-intro", "Trust strip", "h3"),
        sectionParagraph("Highlight your shipping threshold or a key delivery promise.", "home-intro", "Trust strip"),
        sectionHeading("Artisan Guarantee", "home-intro", "Trust strip", "h3"),
        sectionParagraph("Use this slot for quality assurance or handmade authenticity.", "home-intro", "Trust strip"),
        sectionHeading("Organic Materials", "home-intro", "Trust strip", "h3"),
        sectionParagraph("Call out premium fibers, ethical sourcing, or material quality.", "home-intro", "Trust strip"),
        sectionHeading("4.9 Customer Rating", "home-intro", "Trust strip", "h3"),
        sectionParagraph("Feature your strongest trust signal for first-time shoppers.", "home-intro", "Trust strip"),
        sectionHeading("Our Collections", "home-collections", "Curated for you"),
        sectionParagraph(
          "Curated edits of woven bags, statement wall hangings, jewelry, and finishing accents designed to bring warmth, texture, and handmade character into everyday living.",
          "home-collections",
          "Curated for you",
        ),
        sectionHeading("Best Sellers", "home-featured", "Most loved"),
        sectionParagraph(
          "Showcase the pieces customers come back to most, from signature bags to soft home accents and handcrafted details.",
          "home-featured",
          "Most loved",
        ),
        sectionHeading("Made by Hand, Made with Heart", "home-values", "Our craft"),
        sectionParagraph(
          "Every Sofi Knots piece begins with a single strand of organic cotton and hours of meditative knotting. Our artisans bring decades of intuitive expertise to each creation, blending traditional macrame techniques with a contemporary design language.",
          "home-values",
          "Our craft",
        ),
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
        sectionCta("Our story", "/about", "home-values", "Our craft"),
        sectionHeading("What Our Customers Say", "home-testimonials", "Kind words"),
        sectionParagraph(
          "Approved featured reviews from the Reviews admin appear in this section automatically.",
          "home-testimonials",
          "Kind words",
        ),
        sectionHeading("Join Our Circle", "home-newsletter", "Stay connected"),
        sectionParagraph(
          "Be the first to know about new collections, artisan stories, and exclusive offers.",
          "home-newsletter",
          "Stay connected",
        ),
        sectionCta("Subscribe", "#", "home-newsletter", "Stay connected"),
      ],
    },
    {
      slug: "shop",
      route: "/shop",
      label: "Shop landing",
      title: "Shop",
      excerpt: "Manage the merchandising headline, supporting copy, and introductory content shown above the product grid.",
      seoTitle: `Shop ${siteName}`,
      seoDescription: `Browse handcrafted macrame bags, decor, wall art, and accessories from ${siteName}.`,
      seoKeywords: ["shop macrame online", "handmade decor store", "macrame products india"],
      canonicalUrl: "/shop",
      body: [
        sectionHeading("Shop the handcrafted collection", "shop-intro", "Shop intro"),
        sectionParagraph(
          "Use this page area to introduce the store, mention bestsellers or new drops, and add helpful pre-shopping guidance before the live product grid.",
          "shop-intro",
          "Shop intro",
        ),
      ],
    },
    {
      slug: "collections",
      route: "/collections",
      label: "Collections landing",
      title: "Collections",
      excerpt: "Manage the collections landing content shown above the live collection grid.",
      seoTitle: `${siteName} Collections`,
      seoDescription: `Explore curated ${siteName} collections for gifting, home styling, and artisan handmade pieces.`,
      seoKeywords: ["macrame collections", "boho decor collections", "artisan handmade gifts"],
      canonicalUrl: "/collections",
      body: [
        sectionHeading("Discover collections organized by story and style", "collections-intro", "Collections intro"),
        sectionParagraph(
          "Use this section to explain how the collections are organized, highlight your seasonal curation, and support collection-focused SEO.",
          "collections-intro",
          "Collections intro",
        ),
      ],
    },
    {
      slug: "blog",
      route: "/blog",
      label: "Blog landing",
      title: "Blog",
      excerpt: "Manage the editorial intro shown above the live article list.",
      seoTitle: `${siteName} Blog`,
      seoDescription: `Read ${siteName} stories, care guides, launches, and styling articles.`,
      seoKeywords: ["macrame blog", "handmade stories", "styling guides"],
      canonicalUrl: "/blog",
      body: [
        sectionHeading("Stories, guides, and launches", "blog-intro", "Blog intro"),
        sectionParagraph(
          "Use the blog landing page to set the editorial tone, explain what readers will find here, and support blog discovery before the live article feed.",
          "blog-intro",
          "Blog intro",
        ),
      ],
    },
    {
      slug: "about",
      route: "/about",
      label: "About page",
      title: `About ${siteName}`,
      excerpt: "Tell the brand story, craft values, founder note, and warm closing invitation from one editable premium About page.",
      seoTitle: `About ${siteName}`,
      seoDescription: `Learn the story behind ${siteName} and the handcrafted approach shaping every macrame piece.`,
      seoKeywords: ["about sofi knots", "handmade brand story", "macrame artisan brand"],
      canonicalUrl: "/about",
      body: [
        sectionHeading("Woven with patience, warmth, and purpose", "about-story", "Brand story"),
        sectionParagraph(
          `${siteName} is a slow craft studio creating handmade macrame pieces that bring softness, warmth, and meaning into modern homes and memorable gifting moments.`,
          "about-story",
          "Brand story",
        ),
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
        sectionCta("Explore Collections", "/collections", "about-story", "Brand story"),
        sectionHeading("Crafted with intention", "about-values", "Craft values"),
        sectionParagraph(
          "Every piece begins with patient handwork, premium fibers, and a quiet attention to detail that makes each creation feel personal, giftable, and made to last.",
          "about-values",
          "Craft values",
        ),
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
        sectionHeading("Organic materials", "about-values", "Craft values", "h3"),
        sectionParagraph("Natural fibers and premium finishes chosen for softness, beauty, and longevity.", "about-values", "Craft values"),
        sectionHeading("Handmade finish", "about-values", "Craft values", "h3"),
        sectionParagraph("Each piece is shaped slowly by hand so texture, symmetry, and detail feel intentional.", "about-values", "Craft values"),
        sectionHeading("Designed to last", "about-values", "Craft values", "h3"),
        sectionParagraph("Modern heirloom pieces made for thoughtful gifting and long-term everyday use.", "about-values", "Craft values"),
        sectionHeading("A studio rooted in slow craft", "about-founder", "Founder note"),
        sectionParagraph(
          `Use this section to share the deeper studio perspective behind ${siteName}, your making process, and the point of view that shapes every collection.`,
          "about-founder",
          "Founder note",
        ),
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
          cite: `${siteName} studio note`,
          sectionId: "about-founder",
          sectionLabel: "Founder note",
          sectionTheme: "paper",
          sectionLayout: "split",
          sectionSpacing: "airy",
        },
        sectionCta("Contact Us", "/contact", "about-founder", "Founder note"),
        sectionHeading("Bring Sofi Knots into your story", "about-cta", "Brand call to action"),
        sectionParagraph(
          "Invite visitors to browse your collections, explore gifting ideas, or reach out for custom work from this closing section.",
          "about-cta",
          "Brand call to action",
        ),
        sectionCta("Shop All", "/shop", "about-cta", "Brand call to action"),
        sectionCta("Contact Us", "/contact", "about-cta", "Brand call to action"),
      ],
    },
    {
      slug: "contact",
      route: "/contact",
      label: "Contact page",
      title: "Contact",
      excerpt: "Keep support and inquiry details current for customers, gifting, and custom order requests.",
      seoTitle: `Contact ${siteName}`,
      seoDescription: `Contact ${siteName} for support, product questions, gifting requests, or custom orders.`,
      seoKeywords: ["contact sofi knots", "custom macrame order", "support handmade store"],
      canonicalUrl: "/contact",
      body: [
        sectionHeading("Get in touch", "contact-support", "Support details"),
        sectionParagraph(
          `${contactMessage} Email: ${supportEmail}. Phone: ${supportPhone}.`,
          "contact-support",
          "Support details",
        ),
      ],
    },
    {
      slug: "faq",
      route: "/faq",
      label: "FAQ page",
      title: "Frequently Asked Questions",
      excerpt: "Answer the most common pre-purchase and support questions from one editable FAQ page.",
      seoTitle: `${siteName} FAQ`,
      seoDescription: `Find answers about production timelines, customization, shipping, and support for ${siteName}.`,
      seoKeywords: ["sofi knots faq", "shipping and returns faq", "custom handmade order faq"],
      canonicalUrl: "/faq",
      body: [
        sectionHeading("Frequently asked questions", "faq-intro", "FAQ intro"),
        sectionParagraph(
          "Use this page to answer common questions about product care, shipping timelines, handmade production, gifting, and custom orders.",
          "faq-intro",
          "FAQ intro",
        ),
      ],
    },
    {
      slug: "privacy",
      route: "/privacy",
      label: "Privacy policy",
      title: "Privacy Policy",
      excerpt: "Manage privacy policy content from the admin panel and keep it aligned with store operations.",
      seoTitle: `${siteName} Privacy Policy`,
      seoDescription: `Read the ${siteName} privacy policy covering customer data, orders, and communication.`,
      seoKeywords: ["privacy policy ecommerce", "customer data policy", "sofi knots privacy"],
      canonicalUrl: "/privacy",
      body: [
        sectionHeading("Privacy policy", "privacy-body", "Privacy policy"),
        sectionParagraph(
          settings.policies.privacyPolicy ||
            "Add the store privacy policy here. This content is fully editable from the admin panel.",
          "privacy-body",
          "Privacy policy",
        ),
      ],
    },
    {
      slug: "shipping",
      route: "/shipping",
      label: "Shipping & returns",
      title: "Shipping and Returns",
      excerpt: "Control shipping and returns messaging from one admin-managed storefront page.",
      seoTitle: `${siteName} Shipping and Returns`,
      seoDescription: `Learn about ${siteName} shipping timelines, charges, free-shipping thresholds, and returns.`,
      seoKeywords: ["shipping and returns", "handmade order delivery", "macrame shipping india"],
      canonicalUrl: "/shipping",
      body: [
        sectionHeading("Shipping and returns", "shipping-body", "Shipping details"),
        sectionParagraph(
          settings.policies.shippingPolicy ||
            `Delivery timeline: ${settings.shipping.deliveryTimeline || "Managed in admin"}. Shipping charge: Rs. ${settings.shipping.shippingChargeInr.toLocaleString(
              "en-IN",
            )}. Free shipping above Rs. ${settings.shipping.freeShippingThresholdInr.toLocaleString("en-IN")}.`,
          "shipping-body",
          "Shipping details",
        ),
        sectionParagraph(
          settings.policies.returnRefundPolicy ||
            "Add return and refund eligibility, damaged-item flow, and custom-order exceptions here.",
          "shipping-body",
          "Shipping details",
        ),
      ],
    },
    {
      slug: "terms",
      route: "/terms",
      label: "Terms & conditions",
      title: "Terms and Conditions",
      excerpt: "Manage storefront terms, purchasing conditions, and fulfillment terms from admin.",
      seoTitle: `${siteName} Terms and Conditions`,
      seoDescription: `Review the ${siteName} terms and conditions for purchasing, pricing, and fulfillment.`,
      seoKeywords: ["terms and conditions ecommerce", "purchase policy", "sofi knots terms"],
      canonicalUrl: "/terms",
      body: [
        sectionHeading("Terms and conditions", "terms-body", "Terms"),
        sectionParagraph(
          settings.policies.termsAndConditions ||
            "Add order, payment, pricing, and fulfillment terms here so customers can review the latest conditions before purchase.",
          "terms-body",
          "Terms",
        ),
      ],
    },
  ];
}
