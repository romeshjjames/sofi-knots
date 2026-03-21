import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminSeoPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const settings = await getSiteSettings();

  return (
    <AdminShell
      active="seo"
      eyebrow="Growth operations"
      title="On-Page SEO Management"
      description="Control the metadata and search-signal layer for products, collections, blog content, and landing pages from a dedicated SEO workspace."
      stats={[
        { label: "Product SEO", value: "Ready", hint: "Products already support unique title, description, and keyword fields." },
        { label: "Technical SEO", value: "Scaffolded", hint: "Sitemap, robots, canonicals, and schema foundations are in place." },
      ]}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <AdminPanel title="Per-page SEO fields" description="Products, categories, collections, blog posts, and static pages can all carry unique metadata for ranking and click-through rate.">
          <p className="text-sm leading-6 text-brand-warm">
            The next step here is a richer editor for metadata defaults, social card overrides, and content-specific keyword planning.
          </p>
        </AdminPanel>
        <AdminPanel title="Technical SEO controls" description="This area owns default metadata, support schema context, social links, and sitewide search presentation.">
          <SiteSettingsForm settings={settings} />
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
