import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { DiscountManager } from "@/components/admin/discount-manager";
import { getDiscounts } from "@/lib/discounts";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminDiscountsPage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const discounts = await getDiscounts();
  const totalUses = discounts.reduce((sum, item) => sum + item.usageCount, 0);

  return (
    <AdminShell
      active="discounts"
      eyebrow="Offers and promotions"
      title="Discounts"
      description="Create, schedule, target, and monitor discounts from a cleaner Shopify-style promotions workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Discounts" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Active", value: `${discounts.filter((item) => item.status === "active").length}`, hint: "Discounts currently available at checkout." },
        { label: "Scheduled", value: `${discounts.filter((item) => item.status === "scheduled").length}`, hint: "Promotions queued for future publishing." },
        { label: "Draft", value: `${discounts.filter((item) => item.status === "draft").length}`, hint: "Offers still being prepared in admin." },
        { label: "Total uses", value: `${totalUses}`, hint: "Number of redemptions recorded across all visible discounts." },
      ]}
    >
      <AdminPanel
        title="Discount library"
        description="Search, filter, create, edit, schedule, and remove discount rules without crowding the promotions workflow."
      >
        <DiscountManager discounts={discounts} />
      </AdminPanel>
    </AdminShell>
  );
}
