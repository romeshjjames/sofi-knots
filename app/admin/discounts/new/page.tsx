import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DiscountEditor } from "@/components/admin/discount-editor";
import { getDiscountSupportData } from "@/lib/discounts";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminDiscountCreatePage() {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const supportData = await getDiscountSupportData();

  return (
    <AdminShell
      active="discounts"
      eyebrow="Discount detail"
      title="Create discount"
      description="Set up discount type, usage rules, product or collection applicability, customer eligibility, and scheduling."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Discounts", href: "/admin/discounts" },
        { label: "Create discount" },
      ]}
      actions={
        <Link href="/admin/discounts" className="brand-btn-outline px-5 py-3">
          Back to discounts
        </Link>
      }
    >
      <DiscountEditor mode="create" {...supportData} />
    </AdminShell>
  );
}
