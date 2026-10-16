import type { Metadata } from "next";
import { PageShell } from "@/components/pages/PageShell";
import { UninstallForm } from "@/components/pages/UninstallForm";

export const metadata: Metadata = {
  title: "Sorry to see you go — Morphic",
  description: "Tell us what didn't work.",
  alternates: { canonical: "/uninstall" },
  robots: { index: false },
};

/** Set via chrome.runtime.setUninstallURL (§11). */
export default function UninstallPage() {
  return (
    <PageShell cta={false}>
      <h1 className="page-h1">Sorry to see you go.</h1>
      <p className="page-lead">What didn&rsquo;t work? One click helps us make Morphic better.</p>
      <UninstallForm />
    </PageShell>
  );
}
