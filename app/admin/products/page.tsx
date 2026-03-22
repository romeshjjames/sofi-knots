import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { FeaturedMerchandisingManager } from "@/components/admin/featured-merchandising-manager";
import { ProductManager } from "@/components/admin/product-manager";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getFeaturedProductMerchandising, getProductAdminSettingsMap } from "@/lib/admin-data";
import { getCatalogCategories, getCatalogCollections, getCatalogProducts } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminProductsPage() {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const [result, categoriesResult, collectionsResult, featuredMerchandising] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
    getCatalogCollections(),
    getFeaturedProductMerchandising(),
  ]);
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

  return (
    <AdminShell
      active="products"
      eyebrow="Catalog operations"
      title="Products and Inventory"
      description="Manage product records, featured imagery, pricing, inventory, merchandising structure, and SEO fields from one cleaner catalog workspace."
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
        { label: "Categories", value: `${categoriesResult.data.length}`, hint: "Navigation and SEO grouping structures." },
        { label: "Collections", value: `${collectionsResult.data.length}`, hint: "Campaign and merchandising collections." },
        { label: "Data source", value: result.source === "supabase" ? "Live" : "Fallback", hint: result.error || "Catalog is reading from the active data source." },
      ]}
    >
      <div className="space-y-6">
        <AdminPanel
          title="Create products in a dedicated workspace"
          description="To keep the main catalog screen fast and uncluttered, product creation now opens in its own page, similar to Shopify's full-page product editor."
        >
          <div className="flex flex-col gap-4 rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-medium text-slate-950">Open Add Product</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Use the dedicated product editor for title, media, pricing, inventory, shipping, channels, variants, and SEO without crowding this page.
              </p>
            </div>
            <Link href="/admin/products/new" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1f2933] px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
              Open in new window
              <ExternalLink size={16} />
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Catalog structure"
          description="Categories and collections now live in the dedicated Collections area so the products page stays focused on product management."
        >
          <div className="flex flex-col gap-4 rounded-[24px] border border-[#e7eaee] bg-[#fbfcfd] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-medium text-slate-950">Manage categories and collections separately</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Product editing stays cleaner when taxonomy management lives in the Collections workspace instead of the main products screen.
              </p>
            </div>
            <Link href="/admin/collections" className="brand-btn-outline whitespace-nowrap px-5 py-3">
              Open Collections
            </Link>
          </div>
        </AdminPanel>

        <AdminPanel
          title="Featured merchandising"
          description="Arrange the exact order of featured products shown on key storefront placements. This gives you a persistent lineup instead of a simple automatic sort."
        >
          <FeaturedMerchandisingManager
            products={result.data}
            initialProductIds={featuredMerchandising.productIds}
            updatedAt={featuredMerchandising.updatedAt}
          />
        </AdminPanel>
        <AdminPanel
          title="Catalog editor"
          description="Browse products on the left, then update content, pricing, inventory, publishing status, and SEO fields in a focused editor pane."
        >
          <ProductManager products={productsWithAdminSettings} />
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
