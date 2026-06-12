import type { Metadata } from "next";
import {
  Playfair_Display,
  Cormorant_Garamond,
  Inter,
  Manrope,
} from "next/font/google";
import "./globals.css";
import Providers from "@/app/components/layout/Providers";
import ConditionalNavbar from "@/app/components/layout/ConditionalNavbar";
import PromotionalPopupWrapper from "@/app/components/PromotionalPopupWrapper";

// Opt out of static prerendering — all pages are dynamic (require DB/auth at request time)
export const dynamic = "force-dynamic"

// ── Serif: Playfair Display (variable) ──
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// ── Serif: Cormorant Garamond (non-variable — specify weights) ──
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// ── Sans: Inter (variable) ──
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// ── Sans: Manrope (variable) ──
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DACH Home & Body — Luxury Home Fragrance, Natural Skincare & Gift Services",
    template: "%s | DACH Home & Body",
  },
  description:
    "Luxury home fragrance, natural skincare, and curated gift services crafted for the wellness lifestyle. Personal, elegant, and memorable — delivered across Abuja and Nigeria.",
  keywords: [
    "luxury home fragrance",
    "natural skincare",
    "gift services",
    "wellness lifestyle",
    "Abuja fragrance",
    "Nigerian luxury brand",
    "DACH Home and Body",
    "Dachhomeandbody",
    "home scents",
    "body care Nigeria",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "DACH Home & Body",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable} ${manrope.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F5F2] text-[#111111]">
        <Providers>
          <ConditionalNavbar />
          {children}
          <PromotionalPopupWrapper />
        </Providers>
      </body>
    </html>
  );
}
