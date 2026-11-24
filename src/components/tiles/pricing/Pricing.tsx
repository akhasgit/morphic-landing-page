"use client";

import { m as motion } from "motion/react";
import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { cssVars } from "@/lib/css";
import { useOnceTrue } from "@/lib/hooks";
import { checkoutUrl, type Billing } from "@/lib/links";
import { InstallButton } from "@/components/ui/InstallButton";
import { displayPlans, type PlanId } from "./plans";
import { usd, type PlanCatalog } from "@/lib/catalog";

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

const CompareDialog = dynamic(() => import("./CompareDialog"), { ssr: false });

function PaidCta({ plan, billing, label, dark }: { plan: "pro" | "power"; billing: Billing; label: string; dark?: boolean }) {
  const href = checkoutUrl(plan, billing);
  const inExtension = site.upgradeFlow === "in-extension";
  return (
    <>
      <a
        href={href ?? "#"}
        target={href ? "_blank" : undefined}
        rel={href ? "noopener" : undefined}
        className={`btn btn-md w-full ${dark ? "btn-primary" : "btn-ghost"}`}
        onClick={(e) => {
          track("checkout_click", { plan, billing });
          if (!href) {
            e.preventDefault();
            if (process.env.NODE_ENV !== "production") console.warn(`Checkout URL for ${plan}/${billing} is not set`);
          }
        }}
      >
        {href ? label : "Paid plans coming soon"}
      </a>
      {inExtension && <p className="plan-note">Install, then upgrade in Settings</p>}
    </>
  );
}

export function Pricing() {
  const [catalog, setCatalog] = useState<PlanCatalog | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog", { signal: controller.signal }).then(r => { if (!r.ok) throw new Error("unavailable"); return r.json(); }).then(setCatalog).catch(() => { if (!controller.signal.aborted) setUnavailable(true); });
    return () => controller.abort();
  }, []);
  const plans = catalog ? displayPlans(catalog) : [];
  const [billing, setBilling] = useState<Billing>("monthly");
  const [compare, setCompare] = useState(false);
  const compareLoaded = useOnceTrue(compare);
  const scroller = useRef<HTMLDivElement>(null);

  // Mobile: Pro starts centered with Free and Power peeking.
  useEffect(() => {
    const el = scroller.current;
    if (!el || window.innerWidth >= 1024) return;
    const pro = el.querySelector<HTMLElement>('[data-plan="pro"]');
    if (pro) el.scrollLeft = pro.offsetLeft - (el.clientWidth - pro.offsetWidth) / 2;
  }, []);

  return (
    <div className="pr">
      {!catalog && <p role="status">{unavailable ? "Pricing is temporarily unavailable. Please try again later." : "Loading current plans…"}</p>}
      <div className="pr-toggle reveal" style={cssVars({ i: 3 })} role="radiogroup" aria-label="Billing period">
        {(["monthly", "yearly"] as const).map((b) => (
          <button
            key={b}
            type="button"
            role="radio"
            aria-checked={billing === b}
            className="pr-toggle-btn"
            onClick={() => {
              if (b === billing) return;
              setBilling(b);
              track("pricing_billing_toggle", { to: b });
            }}
          >
            {billing === b && <motion.span layoutId="billing-pill" className="pr-toggle-pill" transition={SPRING} />}
            <span className="relative">{b === "monthly" ? "Monthly" : "Yearly"}</span>

          </button>
        ))}
      </div>

      <div ref={scroller} className="pr-cards no-scrollbar">
        {plans.map((p, i) => {
          const price = billing === "monthly" ? p.monthly : p.yearly;
          const pro = p.id === "pro";
          return (
            <div key={p.id} data-plan={p.id} className={`plan reveal ${pro ? "plan-pro" : ""}`} style={cssVars({ i: 4 + i })} data-theme={pro ? "dark" : undefined}>
              {pro && <span className="plan-popular">Most popular</span>}
              <h3 className="plan-name">{p.name}</h3>
              <p className="plan-line">{p.line}</p>
              <div className="plan-price">
                <span>{price === null ? "Unavailable" : usd(price)}</span>
                <span className="plan-per">{billing === "monthly" ? "/mo" : "/yr"}</span>
              </div>
              <p className="plan-sub">
                {p.id === "free" ? "Free plan · No credit card" : price === null ? "Check back later" : billing === "yearly" ? `${usd(price / 12)}/mo equivalent, billed yearly` : "Billed monthly · cancel anytime"}
              </p>
              <div className="plan-cta">
                {p.id === "free" ? (
                  <InstallButton tile="pricing-free" size="md" variant="ghost" short className="w-full" />
                ) : (
                  price === null ? <span>Plan unavailable</span> : <PaidCta plan={p.id as Exclude<PlanId, "free">} billing={billing} label={p.cta} dark={pro} />
                )}
              </div>
              <ul className="plan-includes">
                {p.includes.map((item) => (
                  <li key={item}>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="pr-foot reveal" style={cssVars({ i: 7 })}>
        <button type="button" className="pr-compare" onClick={() => setCompare(true)}>
          Compare all features
        </button>
        <span className="pr-trust">
          Cancel anytime · Secure checkout by Stripe · Card required for paid plans
        </span>

      </div>

      {site.socialProof.length > 0 && <Marquee />}

      {compareLoaded && catalog && <CompareDialog open={compare} onOpenChange={setCompare} catalog={catalog} />}
    </div>
  );
}

/** Only renders when site.socialProof has real entries — never invented (§7.7, §14). */
function Marquee() {
  const quotes = [...site.socialProof, ...site.socialProof];
  return (
    <div className="pr-marquee" aria-label="What people say">
      <div className="pr-marquee-track">
        {quotes.map((q, i) => (
          <figure key={i} className="pr-quote" aria-hidden={i >= site.socialProof.length || undefined}>
            <blockquote>“{q.quote}”</blockquote>
            <figcaption>
              {q.name}, {q.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
