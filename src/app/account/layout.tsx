import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/ui/AppIcon";
import "./account.css";

export const metadata: Metadata = {
  title: "Your Morphic account",
  robots: { index: false, follow: false },
};

/** The account dashboard: plain and fast — none of the homepage's WebGL or motion. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="acct" data-theme="light">
      <header className="acct-head">
        <Link href="/" className="acct-logo" aria-label="Morphic home">
          <AppIcon size={26} />
          <span>Morphic</span>
        </Link>
        <nav className="acct-nav" aria-label="Account">
          <Link href="/account">Overview</Link>
          <Link href="/account/billing">Plan &amp; billing</Link>
          <Link href="/account/key">Anthropic key</Link>
        </nav>
      </header>
      <main className="acct-main">{children}</main>
    </div>
  );
}
