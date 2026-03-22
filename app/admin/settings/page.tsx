import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { StaffPermissionsManager } from "@/components/admin/staff-permissions-manager";
import { getSiteSettings, getStaffMembers } from "@/lib/admin-data";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminSettingsPage() {
  const session = await requireAdminPage(["super_admin"]);
  const [settings, staff] = await Promise.all([getSiteSettings(), getStaffMembers()]);
  const hydratedSettings = {
    ...settings,
    adminProfile: {
      ...settings.adminProfile,
      fullName: settings.adminProfile.fullName ?? session.user.user_metadata?.full_name ?? "Sofi Knots Admin",
      email: settings.adminProfile.email ?? session.user.email ?? null,
    },
  };

  return (
    <AdminShell
      active="settings"
      eyebrow="Administration"
      title="Settings"
      description="Manage store information, branding, shipping, payments, taxes, policies, notifications, SEO defaults, and admin account settings from one central workspace."
      stats={[
        { label: "Staff members", value: `${staff.length}`, hint: "Profiles currently visible in the admin database." },
        { label: "Access control", value: "Role-based", hint: "Permissions are assigned through admin roles." },
        { label: "Support email", value: hydratedSettings.supportEmail || "Not set", hint: "Primary support contact used across the store." },
      ]}
      statsVariant="compact"
    >
      <div className="space-y-6">
        <AdminPanel title="Store settings" description="Update all core store-level configuration sections in a tighter, production-style settings workspace.">
          <SiteSettingsForm settings={hydratedSettings} />
        </AdminPanel>
        <AdminPanel title="Staff permissions" description="Assign roles for catalog, order, content, marketing, and full system administration.">
          <StaffPermissionsManager staff={staff} />
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
