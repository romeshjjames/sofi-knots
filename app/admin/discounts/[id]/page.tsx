import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { DiscountEditor } from "@/components/admin/discount-editor";
import { getDiscountById, getDiscountSupportData } from "@/lib/discounts";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminDiscountDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "marketing_admin"]);
  const [discount, supportData] = await Promise.all([getDiscountById(params.id), getDiscountSupportData()]);

  if (!discount) notFound();

  return (
    <AdminShell
      active="discounts"
      eyebrow="Discount detail"
      title={discount.code}
      description="Review discount rules, usage conditions, eligibility, scheduling, and performance in one promotion editor."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Discounts", href: "/admin/discounts" },
        { label: discount.code },
      ]}
      actions={
        <Link href="/admin/discounts" className="brand-btn-outline px-5 py-3">
          Back to discounts
        </Link>
      }
      statsVariant="compact"
      stats={[
        { label: "Status", value: discount.status, hint: discount.startsAt ? new Date(discount.startsAt).toLocaleString("en-IN") : "Live immediately after save." },
        { label: "Used", value: `${discount.usageCount}`, hint: "Times the discount has been redeemed." },
        { label: "Orders", value: `${discount.orderCount}`, hint: "Orders using this discount." },
        { label: "Impact", value: `Rs. ${discount.revenueImpactInr.toLocaleString("en-IN")}`, hint: "Revenue influenced by the promotion." },
      ]}
    >
      <DiscountEditor discount={discount} mode="edit" {...supportData} />
    </AdminShell>
  );
}
