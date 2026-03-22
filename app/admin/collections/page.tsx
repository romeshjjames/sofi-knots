import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { CollectionsAdmin } from "@/components/admin/collections-admin";
import { getCollectionAdminSettingsMap } from "@/lib/admin-data";
import { getCatalogCollections, getCatalogProducts, resolveCollectionProducts } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminCollectionsPage() {
  await requireAdminPage(["super_admin", "catalog_admin", "content_admin", "marketing_admin"]);

  const [collectionsResult, productsResult] = await Promise.all([getCatalogCollections(), getCatalogProducts()]);
  const collectionIds = collectionsResult.data.map((collection) => collection.id).filter((value): value is string => Boolean(value));
  const settingsMap = await getCollectionAdminSettingsMap(collectionIds);

  const collections = collectionsResult.data.map((collection) => {
    const assignedProducts = productsResult.data.filter((product) => product.collectionId === collection.id).map((product) => product.id);
    const settings = settingsMap[collection.id ?? collection.slug] ?? {
      collectionId: collection.id ?? collection.slug,
      collectionType: "manual" as const,
      status: "active" as const,
      visibility: "visible" as const,
      onlineStoreEnabled: true,
      salesChannels: ["online-store"],
      assignedProductIds: assignedProducts,
      sortProducts: "manual" as const,
      conditions: [],
      updatedAt: null,
    };

    return {
      ...collection,
      productCount: resolveCollectionProducts({
        collection,
        products: productsResult.data,
        settings: {
          ...settings,
          assignedProductIds: settings.assignedProductIds.length ? settings.assignedProductIds : assignedProducts,
        },
      }).length,
      updatedAt: settings.updatedAt,
      settings: {
        ...settings,
        assignedProductIds: settings.assignedProductIds.length ? settings.assignedProductIds : assignedProducts,
      },
    };
  });

  return (
    <AdminShell
      active="collections"
      eyebrow="Catalog structure"
      title="Collections"
      description="Create premium product collections, control publishing, define automated rules, and manage search-ready collection pages from one clean workspace."
      breadcrumbs={[
        { label: "Home", href: "/admin" },
        { label: "Products", href: "/admin/products" },
        { label: "Collections" },
      ]}
      actions={
        <Link href="/collections" className="brand-btn-outline whitespace-nowrap px-5 py-3">
          Preview collections
        </Link>
      }
      stats={[
        { label: "Collections", value: `${collections.length}`, hint: "Organized product groups available across the storefront." },
        { label: "Manual", value: `${collections.filter((item) => item.settings.collectionType === "manual").length}`, hint: "Collections with curated product assignment." },
        { label: "Automated", value: `${collections.filter((item) => item.settings.collectionType === "automated").length}`, hint: "Collections driven by rules and conditions." },
        { label: "Products linked", value: `${productsResult.data.filter((item) => item.collectionId).length}`, hint: "Products currently assigned to a collection." },
      ]}
    >
      <CollectionsAdmin collections={collections} products={productsResult.data} />
    </AdminShell>
  );
}
