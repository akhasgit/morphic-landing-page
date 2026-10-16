import Link from "next/link";
import type { ReactNode } from "react";
import { AppIcon } from "../ui/AppIcon";
import { InstallButton } from "../ui/InstallButton";
import { SiteFooter } from "../ui/SiteFooter";
import "./pages.css";

/** Layout for the normally-scrolling pages (§11): mark, CTA, content, footer. */
export function PageShell({
  children,
  background,
  cta = true,
  className = "",
}: {
  children: ReactNode;
  background?: ReactNode;
  cta?: boolean;
  className?: string;
}) {
  return (
    <div data-theme="light" className={`page-shell ${className}`}>
      {background}
      <header className="page-head">
        <Link href="/" className="page-logo" aria-label="Morphic home">
          <AppIcon size={28} />
          <span>Morphic</span>
        </Link>
        {cta && <InstallButton tile="page-header" size="sm" short />}
      </header>
      <main className="page-main">{children}</main>
      <SiteFooter className="page-footer" />
    </div>
  );
}
