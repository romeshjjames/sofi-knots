import Link from "next/link";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { getCatalogCategories, getCatalogCollections } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminProductCreatePage() {
  await requireAdminPage(["super_admin", "catalog_admin"]);
  const [categoriesResult, collectionsResult] = await Promise.all([getCatalogCategories(), getCatalogCollections()]);

  return (
    <AdminShell
      active="products"
      eyebrow="New product"
      title="Add Product"
      description="Use this full-page product editor for a cleaner Shopify-style add product workflow."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Products", href: "/admin/products" },
        { label: "Add Product" },
      ]}
      actions={
        <Link href="/admin/products" className="brand-btn-outline px-5 py-3">
          Back to products
        </Link>
      }
    >
      <AdminPanel
        title="Product editor"
        description="Add the product details, pricing, inventory, shipping, channels, and SEO in one focused page."
      >
        <ProductCreateForm
          categories={categoriesResult.data}
          collections={collectionsResult.data.map((item) => ({ id: item.id ?? item.slug, name: item.title, slug: item.slug }))}
        />
      </AdminPanel>
    </AdminShell>
  );
}
