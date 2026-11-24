import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/pages/PageShell";
import { policyUrl } from "@/lib/policy";

export const metadata: Metadata = { title: "Privacy policy — Morphic", alternates: { canonical: "/privacy" } };

export default function PolicyPage() {
  const published = policyUrl(process.env.MORPHIC_PRIVACY_POLICY_URL, "/privacy");
  if (published) redirect(published);
  return (
    <PageShell>
      <article className="prose-page">
        <h1 className="page-h1">Privacy policy</h1>
        <p className="prose-meta">Preview for testing. The publisher is preparing the public privacy policy.</p>
        <h2>Page content and account history</h2>
        <p>When you submit a command or use page chat, Morphic can send page text, extracted records and screenshots to its server and to Anthropic to fulfill the request. Morphic saves the command, clarification answers, visible replies, page origin, timestamps and identifiers for your account, login session, conversation and request. Saved layouts and local conversation copies stay in this Chrome profile.</p>
        <h2>Account and billing</h2>
        <p>Morphic uses Google to sign you in. If you choose a paid plan, Stripe collects your payment details. If you supply an Anthropic key, Morphic checks it with Anthropic and encrypts it for use on your account.</p>
        <h2>Access and deletion</h2>
        <p>Open <Link href="/account/history">account history</Link> to read or delete a conversation. Under <Link href="/account/data">Your data</Link> you can download history and request account deletion. Removing the extension clears its local storage. Billing records and backups are held separately.</p>
      </article>
    </PageShell>
  );
}
