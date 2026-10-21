import Link from "next/link";
import { planLabel, shortDate, statusLine } from "@/lib/account/format";
import { requireAccount } from "@/lib/account/server";
import { signOut } from "./actions";

export default async function AccountOverview() {
  const { account } = await requireAccount("/account");
  const { morphs, savedViews } = account;
  const pct = morphs.limit ? Math.min(100, Math.round((morphs.used / morphs.limit) * 100)) : 0;
  return (
    <>
      <div className="acct-title-row">
        <div>
          <h1 className="acct-h1">Your account</h1>
          <p className="acct-sub">{account.user.email}</p>
        </div>
        <form action={signOut}>
          <button className="acct-btn acct-btn-ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>

      {account.status === "past_due" && (
        <div className="acct-banner acct-banner-warn" role="alert">
          Your last payment failed. <Link href="/account/billing">Update your card</Link> to keep {planLabel(account.plan)}.
        </div>
      )}

      <section className="acct-card">
        <div className="acct-card-head">
          <h2>Plan</h2>
          <span className={`acct-badge acct-badge-${account.plan}`}>{planLabel(account.plan)}</span>
        </div>
        <p className="acct-line">{statusLine(account)}</p>
        <Link href="/account/billing" className="acct-btn acct-btn-primary">
          {account.plan === "free" ? (account.trialEligible ? "Try Pro free for 7 days" : "Upgrade") : "Manage plan & billing"}
        </Link>
      </section>

      <section className="acct-card">
        <div className="acct-card-head">
          <h2>Morphs this month</h2>
          <span className="acct-num">
            {morphs.used} / {morphs.limit}
          </span>
        </div>
        <div className={`acct-meter${pct >= 100 ? " full" : ""}`}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="acct-hint">
          Resets {shortDate(morphs.resetsAt)}. A morph is a request that saves a change; questions are free, and runs on your own Anthropic key never count.
        </p>
      </section>

      <section className="acct-card">
        <div className="acct-card-head">
          <h2>Sites with Morphic</h2>
          <span className="acct-num">{savedViews.limit === null ? `${savedViews.used} · unlimited` : `${savedViews.used} / ${savedViews.limit}`}</span>
        </div>
        {savedViews.hosts.length ? (
          <ul className="acct-list">
            {savedViews.hosts.map((host) => (
              <li key={host}>{host}</li>
            ))}
          </ul>
        ) : (
          <p className="acct-hint">No saved views yet. Ask Morphic to change a site and it appears here.</p>
        )}
        {savedViews.limit !== null && <p className="acct-hint">To free a slot, open the site and choose Settings → Data → Remove Morphic in the extension.</p>}
      </section>

      <section className="acct-card">
        <div className="acct-card-head">
          <h2>Anthropic key</h2>
          <span className="acct-num">{account.key.present ? account.key.hint : "Not added"}</span>
        </div>
        <p className="acct-hint">Optional. With your own key, runs are billed to your Anthropic account and don&rsquo;t use morphs.</p>
        <Link href="/account/key" className="acct-btn">
          {account.key.present ? "Replace or remove" : "Add your key"}
        </Link>
      </section>
    </>
  );
}
