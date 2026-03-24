import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { AnalyticsConsentBanner } from "@/components/analytics/analytics-consent-banner";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { CartProvider } from "@/components/cart/cart-provider";
import "./globals.css";
import { buildStorefrontMetadata } from "@/lib/seo";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
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
        <CartProvider>
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {children}
          <AnalyticsConsentBanner />
        </CartProvider>
      </body>
    </html>
  );
}
