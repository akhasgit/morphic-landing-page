import { displayPlans } from "@/components/tiles/pricing/plans";
import { usd, type PlanCatalog } from "@/lib/catalog";
import { Confirmation } from "./Confirmation";
import { planLabel, shortDate, statusLine } from "@/lib/account/format";
import { api, param, requireAccount } from "@/lib/account/server";
import { openPortal, startCheckout, redeemCode } from "../actions";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const query = await searchParams;
  const { account } = await requireAccount("/account/billing");
  const catalog = await api<PlanCatalog>("/v1/catalog").catch(() => null);
  const trialDays = catalog?.trialDays ?? 0;
  const plans = catalog ? displayPlans(catalog) : [];
  const checkout = param(query.checkout);
  const error = param(query.error);
  const paying = (account.subscriptionPlan ?? account.plan) !== "free";
  const paid = plans.filter((p) => p.id !== "free");

  return (
    <>
      <h1 className="acct-h1">Plan &amp; billing</h1>
      {param(query.redeemed) === "1" && <p className="acct-banner" role="status">Code checked. Your current access is shown below.</p>}
      {account.testing?.status === "active" && !paying && <p className="acct-banner">{statusLine(account)} Starting a paid plan replaces testing access.</p>}
      {!paying && <section className="acct-card">
        <h2>Redeem testing access</h2>
        <p className="acct-hint">30 days of Pro features, up to 200 morphs and $80 of hosted usage, subject to the testing group’s budget. No card required and no automatic charges.</p>
        <form action={redeemCode}>
          <label htmlFor="access-code">Access code</label>
          <input id="access-code" name="code" required maxLength={64} autoComplete="off" className="acct-input" />
          <button className="acct-btn acct-btn-primary" type="submit">Redeem code</button>
        </form>
      </section>}
      {checkout === "success" && <Confirmation confirmed={paying && ["active", "trialing"].includes(account.status)} />}
      {checkout === "cancelled" && <p className="acct-banner">Checkout closed. Your verified plan is shown below.</p>}
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

      {!account.billingEnabled || !catalog ? (
        <p className="acct-banner">Paid plans aren&rsquo;t available yet.</p>
      ) : (
        <div className="acct-plans">
          {paid.map((plan) => {
            const current = (account.subscriptionPlan ?? account.plan) === plan.id;
            return (
              <section key={plan.id} className={`acct-card acct-plan${current ? " current" : ""}`}>
                <div className="acct-card-head">
                  <h2>{plan.name}</h2>
                  {current && <span className="acct-badge acct-badge-pro">Current</span>}
                </div>
                <p className="acct-price">
                  {plan.prices.map(price => `${usd(price.amountUsd)} / ${price.interval}`).join(" · ")}
                </p>
                <ul className="acct-list acct-includes">
                  {plan.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {!paying && (
                  <div className="acct-plan-actions">
                    {plan.prices.map(({ interval }) => (
                      <form key={interval} action={startCheckout}>
                        <input type="hidden" name="plan" value={plan.id} />
                        <input type="hidden" name="interval" value={interval} />
                        <button className={`acct-btn${interval === "month" ? " acct-btn-primary" : ""}`} type="submit">
                          {account.trialEligible && trialDays > 0 ? `Try free for ${trialDays} days` : "Upgrade"} · {interval === "month" ? "monthly" : "yearly"}
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
      {account.billingEnabled && account.trialEligible && trialDays > 0 && !paying && (
        <p className="acct-hint acct-center">
          Your first paid plan starts with a {trialDays}-day free trial. Checkout asks for your card, and it&rsquo;s charged when the trial ends unless you cancel before then.
        </p>
      )}
    </>
  );
}
