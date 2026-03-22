import Link from "next/link";
import {
  BadgePercent,
  ArrowRight,
  Bell,
  Box,
  FolderKanban,
  FileText,
  Gem,
  LineChart,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Palette,
  ShieldPlus,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  SquarePen,
  Users2,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

type AdminNavKey =
  | "dashboard"
  | "products"
  | "collections"
  | "orders"
  | "customers"
  | "discounts"
  | "content"
  | "reviews"
  | "customOrders"
  | "inventory"
  | "analytics"
  | "merchandising"
  | "seo"
  | "settings";

type AdminStat = {
  label: string;
  value: string;
  hint: string;
};

type AdminShellProps = {
  active: AdminNavKey;
  title: string;
  description: string;
  children: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
  stats?: AdminStat[];
  breadcrumbs?: { label: string; href?: string }[];
};

const navItems: { key: AdminNavKey; label: string; href: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "products", label: "Products", href: "/admin/products", icon: Package },
  { key: "collections", label: "Collections", href: "/admin/collections", icon: FolderKanban },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { key: "customers", label: "Customers", href: "/admin/customers", icon: Users2 },
  { key: "discounts", label: "Discounts", href: "/admin/discounts", icon: BadgePercent },
  { key: "content", label: "Blog / Content", href: "/admin/content", icon: FileText },
  { key: "reviews", label: "Reviews", href: "/admin/reviews", icon: MessageSquareQuote },
  { key: "customOrders", label: "Custom Orders", href: "/admin/custom-orders", icon: SquarePen },
  { key: "inventory", label: "Inventory", href: "/admin/inventory", icon: Warehouse },
  { key: "analytics", label: "Analytics", href: "/admin/analytics", icon: LineChart },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings2 },
];

export function AdminShell({ active, title, description, children, eyebrow = "Admin workspace", actions, stats = [], breadcrumbs }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f7f8] text-[#1f2933]">
      <div className="grid min-h-screen lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="border-r border-[#e7eaee] bg-[#fbfcfd] px-4 py-5 lg:px-5">
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl border border-[#eceff3] bg-white px-4 py-4 shadow-sm transition hover:border-[#d9dee5]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2933] text-white">
              <Gem size={20} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Sofi Knots</p>
              <p className="font-serif text-2xl text-slate-900">Admin</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition",
                    isActive ? "bg-[#eef2f6] text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-900",
                  )}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                  {isActive ? <ArrowRight size={16} className="ml-auto text-slate-400" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-[#e7eaee] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f5f7] text-slate-700">
                <ShieldPlus size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Admin access</p>
                <p className="text-xs text-slate-500">Catalog, content, campaigns</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Manage collections, products, publishing, and storefront merchandising from one polished workspace.
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="border-b border-[#e7eaee] bg-white px-5 py-5 lg:px-8">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <label className="flex min-w-[260px] items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-4 py-3 text-sm text-slate-500 shadow-sm">
                <Search size={16} />
                <input
                  aria-label="Global admin search"
                  placeholder="Search products, collections, orders, customers"
                  className="w-full bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="flex items-center gap-3">
                <Link href="/admin/products" className="rounded-2xl bg-[#1f2933] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                  Add Product
                </Link>
                <button type="button" className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] text-slate-600 transition hover:bg-white">
                  <Bell size={18} />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </button>
                <div className="flex items-center gap-3 rounded-2xl border border-[#e7eaee] bg-[#fbfcfd] px-3 py-2.5 shadow-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f2933] text-sm font-medium text-white">SK</div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-slate-900">Sofi Knots Admin</p>
                    <p className="text-xs text-slate-500">Store manager</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                {breadcrumbs?.length ? <AdminBreadcrumbs items={breadcrumbs} /> : null}
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
                <h1 className="mt-2 font-serif text-4xl tracking-tight text-slate-950">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {actions}
              </div>
            </div>

            {stats.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-[#e7eaee] bg-[#fbfcfd] px-5 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
                    <p className="mt-2 text-sm text-slate-600">{stat.hint}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </header>

          <div className="px-5 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AdminPanel({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[28px] border border-[#e7eaee] bg-white p-5 shadow-sm lg:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-slate-950">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function AdminBadge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" | "info" }) {
  const tones = {
    default: "bg-brand-cream text-brand-brown border-brand-sand/50",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
  };

  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}
