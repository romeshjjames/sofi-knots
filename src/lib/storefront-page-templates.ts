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
      excerpt: "Use this page to control your homepage hero story, trust content, and primary calls to action.",
      seoTitle: `${siteName} | Handmade Macrame Decor, Bags and Artisan Accessories`,
      seoDescription: siteDescription,
      seoKeywords: ["handmade macrame", siteName.toLowerCase(), "artisan home decor", "macrame bags"],
      canonicalUrl: "/",
      body: [
        sectionHeading("Handcrafted for modern living", "home-hero", "Homepage hero"),
        sectionParagraph(siteDescription, "home-hero", "Homepage hero"),
        sectionCta("Shop the collection", "/shop", "home-hero", "Homepage hero"),
        sectionCta("Discover our story", "/about", "home-hero", "Homepage hero"),
        sectionHeading(`Welcome to ${siteName}`, "home-intro", "Welcome intro"),
        sectionParagraph(
          "Use this section to highlight quick trust signals beneath the hero.",
          "home-intro",
          "Welcome intro",
        ),
        sectionHeading("Free shipping over Rs. 375", "home-intro", "Welcome intro", "h3"),
        sectionParagraph("Highlight your shipping threshold or a key delivery promise.", "home-intro", "Welcome intro"),
        sectionHeading("Artisan guarantee", "home-intro", "Welcome intro", "h3"),
        sectionParagraph("Use this slot for quality assurance or handmade authenticity.", "home-intro", "Welcome intro"),
        sectionHeading("Organic materials", "home-intro", "Welcome intro", "h3"),
        sectionParagraph("Call out premium fibers, ethical sourcing, or material quality.", "home-intro", "Welcome intro"),
        sectionHeading("4.9 customer rating", "home-intro", "Welcome intro", "h3"),
        sectionParagraph("Feature your strongest trust signal for first-time shoppers.", "home-intro", "Welcome intro"),
        sectionHeading("Curated collections for every mood and space", "home-collections", "Collections"),
        sectionParagraph(
          "This intro appears above the live collection grid. Use it to guide discovery and support SEO around your collection themes.",
          "home-collections",
          "Collections",
        ),
        sectionHeading("Most loved pieces", "home-featured", "Featured products"),
        sectionParagraph(
          "Highlight the products customers return to again and again with a short editorial introduction.",
          "home-featured",
          "Featured products",
        ),
        sectionHeading("Freshly added to the studio", "home-arrivals", "New arrivals"),
        sectionParagraph(
          "Use this section to frame new launches, seasonal drops, or limited small-batch releases.",
          "home-arrivals",
          "New arrivals",
        ),
        sectionHeading("Crafted with intention", "home-values", "Why Sofi Knots"),
        sectionParagraph(
          "Use this section as the editorial craft story block with a supporting image and CTA.",
          "home-values",
          "Why Sofi Knots",
        ),
        {
          type: "image",
          url: "",
          alt: "Craft image",
          caption: "Optional craft image",
          sectionId: "home-values",
          sectionLabel: "Why Sofi Knots",
          sectionTheme: "paper",
          sectionLayout: "split",
          sectionSpacing: "airy",
        },
        sectionHeading("Made by hand, made with heart", "home-values", "Why Sofi Knots"),
        sectionParagraph(
          "Describe the artistry, time, and care behind each knot and finish. This area mirrors the homepage craft storytelling block.",
          "home-values",
          "Why Sofi Knots",
        ),
        sectionCta("Our story", "/about", "home-values", "Why Sofi Knots"),
        sectionHeading("Customer love", "home-testimonials", "Testimonials"),
        sectionParagraph(
          "Approved featured reviews from the Reviews admin appear in this section automatically.",
          "home-testimonials",
          "Testimonials",
        ),
        sectionHeading("Stay connected", "home-newsletter", "Newsletter"),
        sectionParagraph(
          "Invite visitors to subscribe for launches, editorial stories, and exclusive updates.",
          "home-newsletter",
          "Newsletter",
        ),
        sectionCta("Contact us", "/contact", "home-newsletter", "Newsletter"),
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
      excerpt: "Tell the brand story, founder vision, and craftsmanship values from one editable page.",
      seoTitle: `About ${siteName}`,
      seoDescription: `Learn the story behind ${siteName} and the handcrafted approach shaping every macrame piece.`,
      seoKeywords: ["about sofi knots", "handmade brand story", "macrame artisan brand"],
      canonicalUrl: "/about",
      body: [
        sectionHeading(`The story behind ${siteName}`, "about-story", "About story"),
        sectionParagraph(
          "Use this page to tell the founder story, explain your craftsmanship philosophy, and build trust around quality and handmade production.",
          "about-story",
          "About story",
        ),
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
