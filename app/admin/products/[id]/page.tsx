import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { ProductDetailEditor } from "@/components/admin/product-detail-editor";
import { getProductAdminSettingsMap, getProductPageContentMap } from "@/lib/admin-data";
import { getAdminCategoryOptions, getAdminCollectionOptions } from "@/lib/admin-catalog";
import { getCatalogProductById } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const [productResult, categoriesResult, collectionsResult] = await Promise.all([
    getCatalogProductById(params.id),
    getAdminCategoryOptions(),
    getAdminCollectionOptions(),
  ]);

  const product = productResult.data;
  if (!product) notFound();

  const [settingsMap, contentMap] = await Promise.all([
    getProductAdminSettingsMap([product.id]),
    getProductPageContentMap([product.id]),
  ]);
  const settings = settingsMap[product.id];
  const pageContent = contentMap[product.id];
  const productWithSettings = settings
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
        pageBody: pageContent?.body ?? [],
      }
    : { ...product, pageBody: pageContent?.body ?? [] };

  return (
    <AdminShell
      active="products"
      eyebrow="Edit product"
      title={product.name}
      description="A dedicated full-page product editor for content, pricing, inventory, variants, shipping, publishing, and SEO."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Products", href: "/admin/products" },
        { label: product.name },
      ]}
      actions={
        <Link href="/admin/products" className="brand-btn-outline px-5 py-3">
          Back to products
        </Link>
      }
    >
      <AdminPanel
        title="Product editor"
        description="This product is edited in a dedicated window so the workflow stays cleaner and closer to Shopify."
      >
        <ProductDetailEditor
          initialProduct={productWithSettings}
          categories={categoriesResult}
          collections={collectionsResult}
        />
      </AdminPanel>
    </AdminShell>
  );
}
