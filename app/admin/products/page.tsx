import Link from "next/link";
import { CollectionMerchandisingManager } from "@/components/admin/collection-merchandising-manager";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { FeaturedMerchandisingManager } from "@/components/admin/featured-merchandising-manager";
import { ProductManager } from "@/components/admin/product-manager";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { getCollectionMerchandising, getFeaturedProductMerchandising, getProductAdminSettingsMap } from "@/lib/admin-data";
import { getCatalogCategories, getCatalogCollections, getCatalogProducts } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminProductsPage() {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const [result, categoriesResult, collectionsResult, featuredMerchandising, collectionMerchandising] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
    getCatalogCollections(),
    getFeaturedProductMerchandising(),
    getCollectionMerchandising(),
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
      description="Manage product records, featured imagery, pricing, merchandising structure, and SEO fields from a more operational catalog workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Products" },
      ]}
      actions={
        <Link href="/shop" className="brand-btn-outline whitespace-nowrap px-5 py-3">
          Preview storefront
        </Link>
      }
      stats={[
        { label: "Products", value: `${result.data.length}`, hint: "All product records currently available in the admin." },
        { label: "Categories", value: `${categoriesResult.data.length}`, hint: "Navigation and SEO grouping structures." },
        { label: "Collections", value: `${collectionsResult.data.length}`, hint: "Campaign and merchandising collections." },
        { label: "Data source", value: result.source === "supabase" ? "Live" : "Fallback", hint: result.error || "Catalog is reading from the active data source." },
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <AdminPanel
            title="Create product"
            description="Add a new catalog record with pricing, descriptions, SEO content, and a featured image. This form is the fast path for launching a new item."
          >
            <ProductCreateForm
              categories={categoriesResult.data}
              collections={collectionsResult.data.map((item) => ({ id: item.id ?? item.slug, name: item.title, slug: item.slug }))}
            />
          </AdminPanel>
          <AdminPanel
            title="Merchandising structure"
            description="Keep categories and collections clean so storefront navigation, campaigns, and on-page SEO landing pages stay organized."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <TaxonomyManager title="Categories" endpoint="/api/admin/categories" items={categoriesResult.data} />
              <TaxonomyManager
                title="Collections"
                endpoint="/api/admin/collections"
                items={collectionsResult.data.map((item) => ({
                  id: item.id ?? item.slug,
                  name: item.title,
                  slug: item.slug,
                  description: item.description,
                  imageUrl: item.imageUrl,
                  sortOrder: item.sortOrder,
                }))}
              />
            </div>
          </AdminPanel>
        </div>

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
          title="Collection merchandising"
          description="Control the order of collection cards across the homepage and collections landing page with drag-and-drop persistence."
        >
          <CollectionMerchandisingManager
            collections={collectionsResult.data.map((item) => ({
              id: item.id,
              title: item.title,
              slug: item.slug,
              description: item.description,
              imageUrl: item.imageUrl,
            }))}
            initialCollectionIds={collectionMerchandising.collectionIds}
            updatedAt={collectionMerchandising.updatedAt}
          />
        </AdminPanel>

        <AdminPanel
          title="Catalog editor"
          description="Browse products on the left, then update content, price, publishing status, and SEO fields in a focused editor pane."
        >
          <ProductManager
            products={productsWithAdminSettings}
            categories={categoriesResult.data}
            collections={collectionsResult.data.map((item) => ({ id: item.id ?? item.slug, name: item.title, slug: item.slug }))}
          />
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
