import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { getPublishedProducts } from "@/lib/catalog";
import { toProductView } from "@/lib/catalog/view";
import { getCurrentSeason } from "@/lib/season";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

// Шрифт по design-system.md, раздел 2: Manrope, выдаётся с нашего сервера
// (next/font скачивает его при сборке) - без запроса к Google у покупателя.
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "OzoneBox",
  description: "Озоновая косметика OzoneBox",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Корзине нужны свежие цены и названия: она хранит у себя только id и количество.
  const products = (await getPublishedProducts()).map(toProductView);
  const season = getCurrentSeason();

  return (
    <html lang="ru" className={manrope.variable}>
      <body>
        <CartProvider products={products}>
          <SiteHeader seasonLabel={season.navLabel} />
          {children}
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
