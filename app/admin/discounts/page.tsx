import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminDiscountsPage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);

  return (
    <AdminShell active="discounts" eyebrow="Offers and promotions" title="Discounts" description="A dedicated promotions workspace will live here next, with coupon rules, campaign scheduling, and channel controls.">
      <AdminPanel title="Coming next" description="This placeholder keeps the admin navigation coherent while discounts management is prepared.">
        <div className="rounded-[24px] border border-dashed border-[#d9dee5] bg-[#fbfcfd] p-8 text-sm text-slate-600">
          Discount codes, campaign logic, free-shipping offers, and promotion analytics will be added here in the next marketing pass.
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
