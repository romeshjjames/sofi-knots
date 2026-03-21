import Link from "next/link";
import {
  ArrowRight,
  Box,
  FileText,
  Home,
  LayoutDashboard,
  Package,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AdminNavKey = "dashboard" | "products" | "orders" | "seo" | "content" | "settings";

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
};

const navItems: { key: AdminNavKey; label: string; href: string; icon: typeof Home }[] = [
  { key: "dashboard", label: "Overview", href: "/admin", icon: LayoutDashboard },
  { key: "products", label: "Catalog", href: "/admin/products", icon: Package },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { key: "seo", label: "SEO", href: "/admin/seo", icon: Sparkles },
  { key: "content", label: "Content", href: "/admin/content", icon: FileText },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings2 },
];

export function AdminShell({ active, title, description, children, eyebrow = "Admin workspace", actions, stats = [] }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-brand-brown">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-brand-sand/60 bg-[#1f1914] px-5 py-6 text-white lg:px-6">
          <Link href="/admin" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:bg-white/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c7a05a] text-[#1f1914]">
              <Box size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Sofi Knots</p>
              <p className="font-serif text-2xl">Commerce OS</p>
            </div>
          </Link>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">Today</p>
            <p className="mt-2 text-lg font-medium text-white">Store operations hub</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Manage catalog, content, orders, and growth tasks from one workspace instead of scattered admin screens.
            </p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.key === active;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    isActive ? "bg-[#c7a05a] text-[#1f1914]" : "text-white/72 hover:bg-white/8 hover:text-white",
                  )}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                  {isActive ? <ArrowRight size={16} className="ml-auto" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Settings2 size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Operator mode</p>
                <p className="text-xs text-white/55">Catalog, payments, SEO</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Next milestone: richer media galleries, bulk actions, and deeper CMS workflows.
            </p>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="border-b border-brand-sand/50 bg-[#fbf8f2]/90 px-5 py-5 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-brand-gold">{eyebrow}</p>
                <h1 className="mt-2 font-serif text-4xl tracking-tight text-brand-brown">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-brand-warm">{description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-[240px] items-center gap-3 rounded-2xl border border-brand-sand/60 bg-white px-4 py-3 text-sm text-brand-taupe shadow-sm">
                  <Search size={16} />
                  <span>Search actions, products, orders</span>
                </div>
                {actions}
              </div>
            </div>

            {stats.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-brand-sand/60 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(65,42,17,0.06)]">
                    <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-brand-brown">{stat.value}</p>
                    <p className="mt-2 text-sm text-brand-warm">{stat.hint}</p>
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
    <section className={cn("rounded-[28px] border border-brand-sand/60 bg-white p-5 shadow-[0_18px_50px_rgba(65,42,17,0.06)] lg:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-brand-brown">{title}</h2>
          {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-warm">{description}</p> : null}
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
