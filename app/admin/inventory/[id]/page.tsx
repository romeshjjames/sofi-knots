import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { InventoryEditor } from "@/components/admin/inventory-editor";
import { getInventoryRecordById } from "@/lib/inventory";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminInventoryDetailPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const record = await getInventoryRecordById(params.id);
  if (!record) notFound();

  return (
    <AdminShell
      active="inventory"
      eyebrow="Inventory detail"
      title={record.productName}
      description="Update stock quantity, inventory tracking settings, variant stock levels, and adjustment history for this product."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Inventory", href: "/admin/inventory" },
        { label: record.productName },
      ]}
      actions={
        <Link href="/admin/inventory" className="brand-btn-outline px-5 py-3">
          Back to inventory
        </Link>
      }
      statsVariant="compact"
      stats={[
        { label: "Available", value: `${record.availableStock}`, hint: "Current sellable quantity." },
        { label: "Incoming", value: `${record.incomingStock}`, hint: "Incoming stock already planned." },
        { label: "Safety stock", value: `${record.safetyStock}`, hint: "Threshold used for low-stock alerts." },
        { label: "Variants", value: `${record.variantCount}`, hint: "Variant rows managed under this product." },
      ]}
    >
      <InventoryEditor record={record} />
    </AdminShell>
  );
}
