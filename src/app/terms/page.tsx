import type { Metadata } from "next";
import { PageShell } from "@/components/pages/PageShell";
import { Ph } from "@/components/ui/Ph";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of service — Morphic",
  description: "The terms for using Morphic.",
  alternates: { canonical: "/terms" },
};

// TODO(AK): provide the terms of service.
const sections = ["Using Morphic", "Your content and the sites you visit", "Plans, billing and cancellation", "Refunds", "Acceptable use", "Disclaimers", "Liability", "Changes to these terms", "Contact"];

export default function TermsPage() {
  return (
    <PageShell>
      <article className="prose-page">
        <h1 className="page-h1">Terms of service</h1>
        <p className="prose-meta">
          Last updated: <Ph value="{{date}}" /> · <Ph value={site.legalEntity} />
        </p>
        {sections.map((s) => (
          <section key={s}>
            <h2>{s}</h2>
            <p>
              <Ph value="{{AK to provide}}" />
            </p>
          </section>
        ))}
      </article>
    </PageShell>
  );
}
