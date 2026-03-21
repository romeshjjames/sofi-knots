# Sofi Knots Commerce Blueprint

## Objective

Build Sofi Knots as a fully admin-managed ecommerce platform on `Next.js + Supabase + Razorpay + Vercel` while preserving the current handcrafted brand design and making SEO a first-class part of the content model.

Important: we can build a site that is strongly optimized for technical SEO and on-page SEO, but no one can truthfully guarantee a first-page Google ranking for competitive terms.

## Stack

- Frontend and full-stack app: Next.js App Router on Vercel
- Database, auth, storage: Supabase
- Payments: Razorpay Orders API + webhook verification
- UI: Tailwind CSS + existing Sofi Knots brand system + shadcn/ui
- Validation: Zod + React Hook Form
- Version control and deployments: GitHub + Vercel

## Delivery Phases

1. Migrate the current Vite storefront into Next.js while preserving the visual design.
2. Create Supabase schema, RLS policies, and admin role model.
3. Build admin panel first so content and products become editable.
4. Replace mock product data with live Supabase-backed queries.
5. Add Razorpay checkout, payment verification, and order sync.
6. Finalize SEO, sitemap, robots, schema markup, redirects, and performance tuning.

## Core Data Model

### Catalog

- `categories`
- `collections`
- `products`
- `product_images`
- `product_variants`
- `inventory_movements`
- `product_tags`

### Commerce

- `customers`
- `addresses`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `coupons`
- `coupon_redemptions`
- `shipping_zones`
- `shipping_rates`

### Content and SEO

- `pages`
- `blog_posts`
- `faqs`
- `site_settings`
- `redirect_rules`
- `seo_overrides`

### Admin and Security

- `profiles`
- `admin_roles`
- `admin_role_permissions`
- `audit_logs`

## Admin Roles

- `super_admin`: full access to settings, billing, users, SEO, products, orders, and content
- `content_admin`: pages, blog, categories, collections, homepage sections, and SEO fields
- `catalog_admin`: products, variants, inventory, pricing, and media
- `order_admin`: orders, fulfillment, refunds, and customer support workflows
- `marketing_admin`: coupons, campaigns, featured sections, landing pages, and SEO reports

## SEO Architecture

SEO needs to be editable from the admin panel for products, categories, collections, blog posts, and static pages.

### Required Fields Per SEO-Aware Entity

- `seo_title`
- `seo_description`
- `seo_keywords`
- `canonical_url`
- `og_title`
- `og_description`
- `og_image_url`
- `robots_index`
- `robots_follow`
- `schema_type`

### Technical SEO Scope

- Server-rendered category, collection, product, blog, and landing pages
- Clean slug-based URLs
- XML sitemap generation
- `robots.txt`
- canonical tags
- Open Graph and Twitter metadata
- Organization, Product, Breadcrumb, Article, FAQ schema
- internal linking between category, collection, product, and content pages
- alt text on all media
- breadcrumbs on all inner pages
- fast image delivery and low layout shift

## Razorpay Flow

1. Customer adds products to cart.
2. Server validates cart, pricing, shipping, and stock.
3. Next.js route creates a Razorpay order using server-side credentials.
4. Client completes payment using Razorpay Checkout.
5. Razorpay webhook confirms payment.
6. Server verifies signature, records payment, creates or updates the order, and reduces stock.
7. Admin panel reflects payment and fulfillment status.

## Supabase Security Model

- Enable RLS on all user-facing tables.
- Use the anon key only on the client.
- Use the service role key only in server routes and admin jobs.
- Restrict writes to admin-managed tables by admin role checks.
- Log catalog, SEO, and order mutations in `audit_logs`.

## App Structure

```text
app/
  (storefront) pages and route handlers
  admin/ admin dashboard pages
  api/ secure server routes
src/
  components/site/
  data/
  lib/
    seo/
    supabase/
    payments/
  features/
    storefront/
    admin/
supabase/
  schema.sql
docs/
  commerce-blueprint.md
```

## Deployment Setup

- GitHub is the source of truth
- Vercel deploys preview builds on pull requests
- Vercel production deploys from the main branch
- Supabase stores environment-specific credentials
- Razorpay secrets remain server-side only
- Add production domain to `NEXT_PUBLIC_SITE_URL`

## Immediate Next Steps

1. Finalize Next.js migration and remove Vite runtime dependencies.
2. Add Supabase project credentials and run the schema.
3. Build admin authentication and role gating.
4. Replace mock product and blog data with Supabase reads.
5. Implement cart, checkout, webhook handling, and order lifecycle.
