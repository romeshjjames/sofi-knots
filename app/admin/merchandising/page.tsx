import Link from "next/link";
import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { CampaignRailsBoard } from "@/components/admin/campaign-rails-board";
import { getCollectionMerchandising, getFeaturedProductMerchandising, getHomepageMerchandising, defaultHomepageSections } from "@/lib/admin-data";
import { getCatalogCollections, getCatalogProducts } from "@/lib/catalog";
import { requireAdminPage } from "@/lib/supabase/auth";

export default async function AdminMerchandisingPage() {
  await requireAdminPage(["super_admin", "catalog_admin", "content_admin", "marketing_admin"]);

  const [productsResult, collectionsResult, featuredMerchandising, collectionMerchandising, homepageMerchandising] = await Promise.all([
    getCatalogProducts(),
    getCatalogCollections(),
    getFeaturedProductMerchandising(),
    getCollectionMerchandising(),
    getHomepageMerchandising(),
  ]);

  const featuredProducts = productsResult.data.filter((product) => product.isFeatured);

  return (
    <AdminShell
      active="merchandising"
      eyebrow="Campaign control"
      title="Unified Merchandising"
      description="Coordinate homepage storytelling, featured product lineup, and collection group sequencing from one campaign board."
      actions={
        <Link href="/" className="brand-btn-outline whitespace-nowrap px-5 py-3">
          Preview homepage
        </Link>
      }
      stats={[
        { label: "Featured products", value: `${featuredProducts.length}`, hint: "Products available for featured homepage rails." },
        { label: "Collections", value: `${collectionsResult.data.length}`, hint: "Collection groups ready for campaign ordering." },
        { label: "Homepage modules", value: `${defaultHomepageSections.length}`, hint: "Sections available to arrange in the homepage narrative." },
      ]}
    >
      <AdminPanel
        title="Campaign rails board"
        description="Drag within each rail, then save once to publish a coordinated campaign structure across your storefront surfaces."
      >
        <CampaignRailsBoard
          products={productsResult.data}
          collections={collectionsResult.data}
          sections={defaultHomepageSections}
          initialFeaturedIds={featuredMerchandising.productIds}
          initialCollectionIds={collectionMerchandising.collectionIds}
          initialSectionOrder={homepageMerchandising.sectionOrder}
          featuredUpdatedAt={featuredMerchandising.updatedAt}
          collectionUpdatedAt={collectionMerchandising.updatedAt}
          homepageUpdatedAt={homepageMerchandising.updatedAt}
        />
      </AdminPanel>
    </AdminShell>
  );
}
