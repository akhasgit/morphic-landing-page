import { plans } from "@/components/tiles/pricing/plans";
import { planLabel, shortDate, statusLine } from "@/lib/account/format";
import { getServerConfig, param, requireAccount } from "@/lib/account/server";
import { openPortal, startCheckout } from "../actions";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const query = await searchParams;
  const { account } = await requireAccount("/account/billing");
  const config = await getServerConfig();
  const trialDays = config?.trialDays ?? 7;
  const checkout = param(query.checkout);
  const error = param(query.error);
  const paying = account.plan !== "free";
  const paid = plans.filter((p) => p.id !== "free");

  return (
    <>
      <h1 className="acct-h1">Plan &amp; billing</h1>
      {checkout === "success" && (
        <div className="acct-banner acct-banner-ok" role="status">
          Thanks! Your plan updates within a few seconds — refresh this page if it hasn&rsquo;t yet. The extension picks it up automatically.
        </div>
      )}
      {checkout === "cancelled" && <div className="acct-banner">Checkout was cancelled. Nothing was charged.</div>}
      {error && (
        <div className="acct-banner acct-banner-warn" role="alert">
          {error}
        </div>
      )}
      {account.status === "past_due" && (
        <div className="acct-banner acct-banner-warn" role="alert">
          Your last payment failed. Update your card under Manage subscription to keep {planLabel(account.plan)}.
        </div>
      )}

      <section className="acct-card">
        <div className="acct-card-head">
          <h2>Current plan</h2>
          <span className={`acct-badge acct-badge-${account.plan}`}>{planLabel(account.plan)}</span>
        </div>
        <p className="acct-line">{statusLine(account)}</p>
        <p className="acct-hint">
          {account.morphs.used} of {account.morphs.limit} morphs used this month (resets {shortDate(account.morphs.resetsAt)}).
        </p>
        {(paying || account.status !== "free") && account.billingEnabled && (
          <form action={openPortal}>
            <button className="acct-btn" type="submit">
              Manage subscription
            </button>
            <p className="acct-hint">Change plan, update your card, see invoices or cancel — on Stripe.</p>
          </form>
        )}
      </section>

      {!account.billingEnabled ? (
        <p className="acct-banner">Paid plans aren&rsquo;t available yet.</p>
      ) : (
        <div className="acct-plans">
          {paid.map((plan) => {
            const current = account.plan === plan.id;
            return (
              <section key={plan.id} className={`acct-card acct-plan${current ? " current" : ""}`}>
                <div className="acct-card-head">
                  <h2>{plan.name}</h2>
                  {current && <span className="acct-badge acct-badge-pro">Current</span>}
                </div>
                <p className="acct-price">
                  <strong>${plan.monthly}</strong> / month · or ${plan.yearly} / year
                </p>
                <ul className="acct-list acct-includes">
                  {plan.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {!paying && (
                  <div className="acct-plan-actions">
                    {(["month", "year"] as const).map((interval) => (
                      <form key={interval} action={startCheckout}>
                        <input type="hidden" name="plan" value={plan.id} />
                        <input type="hidden" name="interval" value={interval} />
                        <button className={`acct-btn${interval === "month" ? " acct-btn-primary" : ""}`} type="submit">
                          {account.trialEligible ? `Try free for ${trialDays} days` : "Upgrade"} · {interval === "month" ? "monthly" : "yearly"}
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
      {account.billingEnabled && account.trialEligible && !paying && (
        <p className="acct-hint acct-center">
          Your first paid plan starts with a {trialDays}-day free trial. Checkout asks for your card, and it&rsquo;s charged when the trial ends unless you cancel before then.
        </p>
      )}
    </>
  );
}
