import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { StorefrontMap } from "@/components/admin/storefront-map";
import { getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminContentPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const pages = await getPages();

  return (
    <AdminShell
      active="pages"
      eyebrow="Storefront coverage"
      title="Frontend Management"
      description="Verify which admin workspace controls each public route and keep the storefront fully editable from admin."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Frontend Management" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Core pages", value: `${pages.filter((page) => page.isCoreStorefrontPage).length}`, hint: "Provisioned storefront pages in the CMS." },
        { label: "Published", value: `${pages.filter((page) => page.isCoreStorefrontPage && page.status === "published").length}`, hint: "Core storefront pages currently live." },
        { label: "Custom pages", value: `${pages.filter((page) => !page.isCoreStorefrontPage).length}`, hint: "Additional landing pages created from admin." },
      ]}
    >
      <AdminPanel title="Storefront route ownership" description="Use this map to verify page-by-page coverage and jump directly into the correct admin editor for each public route.">
        <StorefrontMap pages={pages} />
      </AdminPanel>
    </AdminShell>
  );
}
