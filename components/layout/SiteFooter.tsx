import Link from "next/link";
import { Logo } from "./Logo";

// Подвал (brief-glavnaya.md, блок 6). Оферта, политика и контакты появятся
// с юридическими текстами (фаза 7) - ссылок на несуществующие страницы не ставим.
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Logo />
        <p className="site-footer__text">Озоновая косметика</p>
        <Link href="/#katalog" className="site-footer__link">
          Весь каталог
        </Link>
      </div>
    </footer>
  );
}
