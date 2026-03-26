import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getCatalogCollections } from "@/lib/catalog";
import { getStorefrontSettings } from "@/lib/storefront";

export async function StorefrontNavbar() {
  const [settings, collectionsResult] = await Promise.all([getStorefrontSettings(), getCatalogCollections()]);
  return (
    <>
      <AnnouncementBar announcement={settings.announcementBar} />
      <Navbar
        siteName={settings.siteName}
        logoUrl={settings.logoUrl}
        collections={collectionsResult.data.map((collection) => ({
          title: collection.title,
          slug: collection.slug,
        }))}
      />
    </>
  );
}

export async function StorefrontFooter() {
  const settings = await getStorefrontSettings();
  return (
    <Footer
      siteName={settings.siteName}
      logoUrl={settings.logoUrl}
      footerBrandText={settings.footerBrandText}
      supportEmail={settings.supportEmail}
      supportPhone={settings.supportPhone}
      socialLinks={settings.socialLinks}
    />
  );
}
