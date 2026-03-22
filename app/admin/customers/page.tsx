import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomersPage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);

  return (
    <AdminShell active="customers" eyebrow="Customer relationships" title="Customers" description="A clean customer workspace will live here next, with profiles, order history, and segmentation.">
      <AdminPanel title="Coming next" description="This placeholder keeps the admin navigation complete while the dedicated customer CRM flow is being built.">
        <div className="rounded-[24px] border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-8 text-sm text-slate-600">
          Customer profiles, lifecycle insights, and contact history will be added here in the next CRM-focused pass.
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
