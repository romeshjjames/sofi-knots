create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('super_admin', 'content_admin', 'catalog_admin', 'order_admin', 'marketing_admin')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  seo_title text,
  seo_description text,
  seo_keywords text[] default '{}',
  canonical_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  seo_title text,
  seo_description text,
  seo_keywords text[] default '{}',
  canonical_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  description text,
  price_inr integer not null,
  compare_at_price_inr integer,
  featured_image_url text,
  badge text,
  rating numeric(2,1) default 0,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  seo_keywords text[] default '{}',
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  sku text unique,
  price_inr integer not null,
  compare_at_price_inr integer,
  stock_quantity integer not null default 0,
  attributes jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'fulfilled', 'cancelled', 'refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'authorized', 'paid', 'failed', 'refunded')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'returned')),
  currency text not null default 'INR',
  subtotal_inr integer not null default 0,
  shipping_inr integer not null default 0,
  discount_inr integer not null default 0,
  total_inr integer not null default 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  sku text,
  quantity integer not null,
  unit_price_inr integer not null,
  line_total_inr integer not null
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body jsonb not null default '[]'::jsonb,
  excerpt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  seo_keywords text[] default '{}',
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body jsonb not null default '[]'::jsonb,
  cover_image_url text,
  author_name text,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  seo_keywords text[] default '{}',
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Sofi Knots',
  site_url text,
  default_meta_title text,
  default_meta_description text,
  default_meta_keywords text[] default '{}',
  support_email text,
  support_phone text,
  social_links jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.pages enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;

create policy "Public can read active categories"
on public.categories for select
using (is_active = true);

create policy "Public can read active collections"
on public.collections for select
using (is_active = true);

create policy "Public can read active products"
on public.products for select
using (status = 'active');

create policy "Public can read product images"
on public.product_images for select
using (true);

create policy "Public can read product variants"
on public.product_variants for select
using (true);

create policy "Public can read published pages"
on public.pages for select
using (status = 'published');

create policy "Public can read published blog posts"
on public.blog_posts for select
using (status = 'published');

create policy "Authenticated users can read their profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Authenticated users can update their profile"
on public.profiles for update
using (auth.uid() = id);

-- Admin write policies should be created after helper SQL functions are added
-- for role checks. Keep service-role-only writes until then.
