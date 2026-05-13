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
    default: "Dachhomeandbody — Luxury Fragrances & Body Care",
    template: "%s | Dachhomeandbody",
  },
  description:
    "Crafted scents for unforgettable presence. Luxury fragrances and body care designed to leave a lasting impression.",
  keywords: [
    "luxury fragrance",
    "perfume",
    "body care",
    "eau de parfum",
    "Nigerian fragrance",
  ],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Dachhomeandbody",
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
      <body className="min-h-full flex flex-col bg-[#FAF6F1] text-[#111111]">
        <Providers>
          <ConditionalNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
