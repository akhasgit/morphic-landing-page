import Link from "next/link";
export default function BillingReturn() {
  return <main style={{ maxWidth: 640, margin: "80px auto", padding: 24 }}>
    <h1>Return to Morphic</h1>
    <p>Open the Morphic side panel to check your plan. Confirmation can take a moment. This page does not confirm a payment.</p>
    <p><Link href="/account/billing">Open account billing</Link> — sign in with the same Google account used in the extension.</p>
  </main>;
}
