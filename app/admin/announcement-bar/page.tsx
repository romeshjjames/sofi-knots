import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { AnnouncementBarForm } from "@/components/admin/announcement-bar-form";
import { getAnnouncementBar } from "@/lib/announcement-bar";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminAnnouncementBarPage() {
  await requireAdminPage(["super_admin", "content_admin", "marketing_admin"]);
  const announcement = await getAnnouncementBar();

  return (
    <AdminShell
      active="announcementBar"
      eyebrow="Storefront messaging"
      title="Announcement Bar"
      description="Manage the top storefront announcement bar, including text, CTA link, active state, and optional schedule dates."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Announcement Bar" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Status", value: announcement.isActive ? "Active" : "Inactive", hint: "Current storefront announcement visibility." },
        { label: "Has CTA", value: announcement.ctaLink ? "Yes" : "No", hint: "Whether the bar links to a storefront destination." },
        { label: "Scheduled", value: announcement.startsAt || announcement.endsAt ? "Yes" : "No", hint: "Uses date-based visibility control." },
      ]}
    >
      <AdminPanel
        title="Announcement bar content"
        description="Update the message customers see at the very top of the website."
      >
        <AnnouncementBarForm initial={announcement} />
      </AdminPanel>
    </AdminShell>
  );
}
