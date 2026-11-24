import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/pages/PageShell";
import { policyUrl } from "@/lib/policy";

export const metadata: Metadata = { title: "Terms of service — Morphic", alternates: { canonical: "/terms" } };

export default function PolicyPage() {
  const published = policyUrl(process.env.MORPHIC_TERMS_URL, "/terms");
  if (published) redirect(published);
  return (
    <PageShell>
      <article className="prose-page">
        <h1 className="page-h1">Terms of service</h1>
        <p className="prose-meta">Preview for testing. The publisher is preparing the public terms of service.</p>
        <h2>Using Morphic</h2>
        <p>Sign in with Google to use the extension on supported desktop Chrome pages. You can switch a page back to its original layout. Check generated summaries and actions before relying on them.</p>
        <h2>Plans and testing access</h2>
        <p>Stripe Checkout shows the price, billing interval and any trial before you subscribe. Manage billing lets you update your card and cancel. Testing codes have time and usage limits and can be revoked. Redeeming a testing code does not create a paid subscription.</p>
        <p>Visit <Link href="/account/billing">account billing</Link> to see your current access and subscription.</p>
      </article>
    </PageShell>
  );
}
