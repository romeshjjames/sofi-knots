import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { buildMetadata } from "@/lib/seo";

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

export const metadata: Metadata = buildMetadata({
  title: "Sofi Knots | Handmade Macrame Decor, Gifts and Artisan Accessories",
  description:
    "Shop handmade macrame decor, gifts, and artisan accessories by Sofi Knots. Designed for soulful homes, special gifting, and elegant everyday style.",
  path: "/",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jost.variable} ${cormorant.variable}`}>{children}</body>
    </html>
  );
}
