import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { StaffPermissionsManager } from "@/components/admin/staff-permissions-manager";
import { getSiteSettings, getStaffMembers } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminSettingsPage() {
  await requireAdminPage(["super_admin"]);
  const [settings, staff] = await Promise.all([getSiteSettings(), getStaffMembers()]);

  return (
    <AdminShell
      active="settings"
      eyebrow="Administration"
      title="Settings and Staff"
      description="Manage sitewide defaults, support information, and staff permissions from one administrative workspace."
      stats={[
        { label: "Staff members", value: `${staff.length}`, hint: "Profiles currently visible in the admin database." },
        { label: "Access control", value: "Role-based", hint: "Permissions are assigned through admin roles." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <AdminPanel title="Site defaults" description="Set the operational and SEO defaults that power the storefront globally.">
          <SiteSettingsForm settings={settings} />
        </AdminPanel>
        <AdminPanel title="Staff permissions" description="Assign roles for catalog, order, content, marketing, and full system administration.">
          <StaffPermissionsManager staff={staff} />
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
