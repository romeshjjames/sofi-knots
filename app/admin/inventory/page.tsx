import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { getInventoryRecords } from "@/lib/inventory";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminInventoryPage() {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const records = await getInventoryRecords();

  return (
    <AdminShell
      active="inventory"
      eyebrow="Stock control"
      title="Inventory"
      description="Manage stock quantity, low-stock alerts, variant inventory, and replenishment settings from one cleaner inventory workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Inventory" },
      ]}
      statsVariant="compact"
      stats={[
        { label: "Tracked SKUs", value: `${records.length}`, hint: "Catalog records currently included in stock monitoring." },
        { label: "Low stock", value: `${records.filter((item) => item.stockStatus === "low_stock").length}`, hint: "Products below the defined safety stock threshold." },
        { label: "Out of stock", value: `${records.filter((item) => item.stockStatus === "out_of_stock").length}`, hint: "Products currently unavailable for sale." },
        { label: "Variants", value: `${records.filter((item) => item.hasVariants).length}`, hint: "Products whose stock is managed at the variant level." },
      ]}
    >
      <AdminPanel title="Inventory workspace" description="Search stock records, review low-stock alerts, and open products into a dedicated stock-control editor.">
        <InventoryManager records={records} />
      </AdminPanel>
    </AdminShell>
  );
}
