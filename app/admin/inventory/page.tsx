import { AlertTriangle } from "lucide-react";
import { AdminBadge, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { buildInventoryRows } from "@/lib/admin-suite-data";
import { getCatalogProducts } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminInventoryPage() {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const productsResult = await getCatalogProducts();
  const inventoryRows = buildInventoryRows(productsResult.data);
  const lowStock = inventoryRows.filter((item) => item.status !== "healthy");

  return (
    <AdminShell
      active="inventory"
      eyebrow="Stock control"
      title="Inventory"
      description="Monitor stock, reserved quantities, and incoming replenishment across the catalog with a cleaner warehouse-facing view."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Inventory" },
      ]}
      stats={[
        { label: "Tracked SKUs", value: `${inventoryRows.length}`, hint: "Catalog rows currently included in stock monitoring." },
        { label: "Low stock alerts", value: `${lowStock.filter((item) => item.status === "low").length}`, hint: "Products that need replenishment planning." },
        { label: "Out of stock", value: `${lowStock.filter((item) => item.status === "out").length}`, hint: "Products unavailable for sale right now." },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminPanel title="Stock overview" description="Current stock, reserved quantities, and incoming replenishment.">
          <div className="overflow-hidden rounded-[24px] border border-[#e7eaee]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#fbfcfd] text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">SKU</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Reserved</th>
                  <th className="px-5 py-4 font-medium">Incoming</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map((row) => (
                  <tr key={row.id} className="border-t border-[#eef1f4] bg-white">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{row.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{row.category}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{row.sku}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{row.stock}</td>
                    <td className="px-5 py-4 text-slate-700">{row.reserved}</td>
                    <td className="px-5 py-4 text-slate-700">{row.incoming}</td>
                    <td className="px-5 py-4">
                      <AdminBadge tone={row.status === "healthy" ? "success" : row.status === "low" ? "warning" : "danger"}>{row.status}</AdminBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel title="Low stock alerts" description="Priority replenishment items needing attention.">
            <div className="space-y-3">
              {lowStock.map((row) => (
                <div key={row.id} className="flex items-start gap-3 rounded-2xl bg-[#fbfcfd] p-4 text-sm text-slate-600">
                  <AlertTriangle size={18} className="mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-medium text-slate-900">{row.name}</p>
                    <p className="mt-1">Only {row.stock} units available with {row.incoming} incoming.</p>
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </div>
    </AdminShell>
  );
}
