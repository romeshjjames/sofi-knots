import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CustomOrderEditor } from "@/components/admin/custom-order-editor";
import { getCustomOrderById } from "@/lib/custom-orders";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCustomOrderDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "order_admin", "marketing_admin"]);
  const customOrder = await getCustomOrderById(params.id);
  if (!customOrder) notFound();

  return (
    <AdminShell
      active="customOrders"
      eyebrow="Inquiry detail"
      title={customOrder.productType}
      description="Full request details, quote notes, production context, and status controls for this bespoke order inquiry."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Custom Orders", href: "/admin/custom-orders" },
        { label: customOrder.customerName },
      ]}
      actions={
        <Link href="/admin/custom-orders" className="brand-btn-outline px-5 py-3">
          Back to inquiries
        </Link>
      }
      statsVariant="compact"
      stats={[
        { label: "Budget", value: customOrder.budget || "Not set", hint: "Client budget expectation for this project." },
        { label: "Status", value: customOrder.status.replace(/_/g, " "), hint: "Current stage of the custom-order pipeline." },
        { label: "Estimate", value: customOrder.estimatedPrice || "Not quoted", hint: "Current quoted or estimated amount." },
        { label: "Delivery", value: customOrder.expectedCompletionDate ? new Date(customOrder.expectedCompletionDate).toLocaleDateString("en-IN") : "Not scheduled", hint: "Expected completion or delivery date." },
      ]}
    >
      <CustomOrderEditor customOrder={customOrder} mode="edit" />
    </AdminShell>
  );
}
