import type { Metadata } from "next";
import Link from "next/link";
import { PageField } from "@/components/pages/PageField";
import { AppIcon } from "@/components/ui/AppIcon";
import "@/components/pages/pages.css";

export const metadata: Metadata = {
  title: "Page not found — Morphic",
  robots: { index: false },
};

/** 404 (§11): the dot field arrives scattered and reassembles into "404". */
export default function NotFound() {
  return (
    <div data-theme="hero" className="page-shell nf">
      <PageField formation={{ kind: "text", text: "404" }} intro="scatter" layout="404" />
      <header className="page-head">
        <Link href="/" className="page-logo" aria-label="Morphic home">
          <AppIcon size={28} />
          <span>Morphic</span>
        </Link>
      </header>
      <main className="nf-copy">
        <h1 className="sr-only">404 — page not found</h1>
        <p className="nf-title">This page didn&rsquo;t morph.</p>
        <Link href="/" className="btn btn-primary btn-lg">
          Back home
        </Link>
      </main>
    </div>
  );
}
