import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { CustomerAuthProvider } from "@/components/customer/customer-auth-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import "./globals.css";
import { buildStorefrontMetadata } from "@/lib/seo";

const AnalyticsTracker = dynamic(
  () => import("@/components/analytics/analytics-tracker").then((mod) => mod.AnalyticsTracker),
  { ssr: false },
);

const AnalyticsConsentBanner = dynamic(
  () => import("@/components/analytics/analytics-consent-banner").then((mod) => mod.AnalyticsConsentBanner),
  { ssr: false },
);

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600"],
});

export async function generateMetadata(): Promise<Metadata> {
  return buildStorefrontMetadata({
    title: "Sofi Knots | Handmade Macrame Decor, Gifts and Artisan Accessories",
    description:
      "Shop handmade macrame decor, gifts, and artisan accessories by Sofi Knots. Designed for soulful homes, special gifting, and elegant everyday style.",
    path: "/",
  });
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jost.variable} ${cormorant.variable}`}>
        <CustomerAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <AnalyticsTracker />
              </Suspense>
              {children}
              <AnalyticsConsentBanner />
            </CartProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
