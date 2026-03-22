import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { HomepageSectionsManager } from "@/components/admin/homepage-sections-manager";
import { defaultHomepageSections, getHomepageMerchandising } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminContentPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const homepageMerchandising = await getHomepageMerchandising();

  return (
    <AdminShell
      active="pages"
      eyebrow="Homepage content"
      title="Homepage Sections"
      description="Keep homepage storytelling and section ordering separate from page management and editorial blog publishing."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Homepage Sections" },
      ]}
    >
      <AdminPanel title="Homepage layout" description="Reorder homepage storytelling sections so campaign priorities can shift without another code change.">
        <HomepageSectionsManager
          sections={defaultHomepageSections}
          initialSectionOrder={homepageMerchandising.sectionOrder}
          updatedAt={homepageMerchandising.updatedAt}
        />
      </AdminPanel>
    </AdminShell>
  );
}
