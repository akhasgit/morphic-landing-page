import type { Metadata } from "next";
import { PageShell } from "@/components/pages/PageShell";
import { Ph } from "@/components/ui/Ph";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy — Morphic",
  description: "How Morphic handles page content, screenshots and your data.",
  alternates: { canonical: "/privacy" },
};

// TODO(AK): provide the privacy policy. Required for the Chrome Web Store listing.
const sections = [
  "What Morphic reads on the pages you use it on",
  "What is sent to Morphic's servers, and why",
  "Screenshots",
  "Retention",
  "Training use",
  "Accounts, payments and analytics",
  "Your choices and how to delete your data",
  "Contact",
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="prose-page">
        <h1 className="page-h1">Privacy policy</h1>
        <p className="prose-meta">
          Last updated: <Ph value="{{date}}" />
        </p>
        <p>
          <Ph value={site.privacyLine} />
        </p>
        {sections.map((s) => (
          <section key={s}>
            <h2>{s}</h2>
            <p>
              <Ph value="{{AK to provide}}" />
            </p>
          </section>
        ))}
        <p className="mt-10">
          Questions? <Ph value={site.supportEmail} />
        </p>
      </article>
    </PageShell>
  );
}
