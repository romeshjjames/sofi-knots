import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { PagesManager } from "@/components/admin/pages-manager";
import { getPages } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminPagesPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const pages = await getPages();

  return (
    <AdminShell
      active="pages"
      eyebrow="Page management"
      title="Pages"
      description="Manage landing pages, FAQs, policy pages, and other storefront pages from a tighter workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Pages" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Pages", value: `${pages.length}`, hint: "Standalone pages in the CMS." },
        { label: "Published", value: `${pages.filter((page) => page.status === "published").length}`, hint: "Pages currently visible on the storefront." },
        { label: "Draft", value: `${pages.filter((page) => page.status === "draft").length}`, hint: "Pages still being prepared." },
      ]}
    >
      <AdminPanel title="Page library" description="Open, create, and manage pages without mixing them into the blog workflow.">
        <PagesManager pages={pages} />
      </AdminPanel>
    </AdminShell>
  );
}
