import Link from "next/link";
import { CartButton } from "@/components/cart/CartButton";
import { Logo } from "./Logo";

// Шапка (brief-glavnaya.md, блок 1): знак, ссылка на каталог, корзина со счётчиком.
export function SiteHeader({ seasonLabel }: { seasonLabel: string }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__home" aria-label="OzoneBox, на главную">
          <Logo />
        </Link>
        <nav className="site-header__nav" aria-label="Разделы">
          <Link href="/#podborka">{seasonLabel}</Link>
          <Link href="/#katalog">Каталог</Link>
        </nav>
        <CartButton />
      </div>
    </header>
  );
}
