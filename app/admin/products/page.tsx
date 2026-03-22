import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductManager } from "@/components/admin/product-manager";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getProductAdminSettingsMap } from "@/lib/admin-data";
import { getCatalogProducts } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminProductsPage() {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const result = await getCatalogProducts();
  const settingsMap = await getProductAdminSettingsMap(result.data.map((product) => product.id));
  const productsWithAdminSettings = result.data.map((product) => {
    const settings = settingsMap[product.id];
    return settings
      ? {
          ...product,
          vendor: settings.vendor,
          tags: settings.tags,
          costPerItem: settings.costPerItem,
          barcode: settings.barcode,
          inventoryQuantity: settings.inventoryQuantity,
          inventoryTracking: settings.inventoryTracking,
          continueSellingWhenOutOfStock: settings.continueSellingWhenOutOfStock,
          physicalProduct: settings.physicalProduct,
          weight: settings.weight,
          salesChannels: settings.salesChannels,
        }
      : product;
  });
  const activeCount = productsWithAdminSettings.filter((product) => product.status === "active").length;
  const draftCount = productsWithAdminSettings.filter((product) => product.status === "draft").length;
  const archivedCount = productsWithAdminSettings.filter((product) => product.status === "archived").length;

  return (
    <AdminShell
      active="products"
      eyebrow="Catalog operations"
      title="Products and Inventory"
      description="Manage products from a cleaner, focused workspace with search, bulk actions, inventory visibility, and dedicated add/edit windows."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Products" },
      ]}
      actions={
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" target="_blank" rel="noreferrer" className="rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            <span className="inline-flex items-center gap-2"><Plus size={16} /> Add product</span>
          </Link>
          <Link href="/shop" className="brand-btn-outline whitespace-nowrap px-5 py-3">
            Preview storefront
          </Link>
        </div>
      }
      stats={[
        { label: "Products", value: `${result.data.length}`, hint: "All product records currently available in the admin." },
        { label: "Active", value: `${activeCount}`, hint: "Products currently visible on the storefront." },
        { label: "Draft", value: `${draftCount}`, hint: "Products saved but not yet published." },
        { label: "Archived", value: `${archivedCount}`, hint: "Products removed from active selling." },
        { label: "Data source", value: result.source === "supabase" ? "Live" : "Fallback", hint: result.error || "Catalog is reading from the active data source." },
      ]}
    >
      <div className="space-y-6">
        <AdminPanel
          title="Products"
          description="A cleaner product workspace for search, filters, bulk actions, and opening add/edit product screens in dedicated windows."
        >
          <ProductManager products={productsWithAdminSettings} />
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
