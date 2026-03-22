import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { getStorefrontSettings } from "@/lib/storefront";

export async function StorefrontNavbar() {
  const settings = await getStorefrontSettings();
  return <Navbar siteName={settings.siteName} />;
}

export async function StorefrontFooter() {
  const settings = await getStorefrontSettings();
  return (
    <Footer
      siteName={settings.siteName}
      footerBrandText={settings.footerBrandText}
      supportEmail={settings.supportEmail}
      supportPhone={settings.supportPhone}
      socialLinks={settings.socialLinks}
    />
  );
}
