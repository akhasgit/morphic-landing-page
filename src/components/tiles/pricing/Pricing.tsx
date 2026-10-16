"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { Check } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { cssVars } from "@/lib/css";
import { useOnceTrue } from "@/lib/hooks";
import { checkoutUrl, type Billing } from "@/lib/links";
import { isSet } from "@/lib/placeholder";
import { InstallButton } from "@/components/ui/InstallButton";
import { Ph } from "@/components/ui/Ph";
import { plans, type PlanId } from "./plans";

const CompareDialog = dynamic(() => import("./CompareDialog"), { ssr: false });

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

/** Prices change with a vertical digit roll (§7.7). */
function RollingPrice({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="roll">
      <span className="sr-only">${value}</span>
      <span aria-hidden="true">$</span>
      <span className="roll-digits" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {digits.map((d, i) => {
            const place = digits.length - i; // key by place value so units persist
            return (
              <motion.span
                key={place}
                className="roll-col"
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={SPRING}
              >
                <motion.span className="roll-strip" initial={false} animate={{ y: `${-Number(d) * 10}%` }} transition={SPRING}>
                  {Array.from({ length: 10 }, (_, n) => (
                    <span key={n}>{n}</span>
                  ))}
                </motion.span>
              </motion.span>
            );
          })}
        </AnimatePresence>
      </span>
    </span>
  );
}

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
        {label}
      </a>
      {inExtension && <p className="plan-note">Install, then upgrade in Settings</p>}
    </>
  );
}

export function Pricing() {
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
            {b === "yearly" && <span className="pr-save">2 months free</span>}
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
                <RollingPrice value={price} />
                <span className="plan-per">{billing === "monthly" ? "/mo" : "/yr"}</span>
              </div>
              <p className="plan-sub">
                {p.id === "free" ? "Free plan · No credit card" : billing === "yearly" ? `$${Math.round(price / 12)}/mo, billed yearly` : "Billed monthly · cancel anytime"}
              </p>
              <div className="plan-cta">
                {p.id === "free" ? (
                  <InstallButton tile="pricing-free" size="md" variant="ghost" short className="w-full" />
                ) : (
                  <PaidCta plan={p.id as Exclude<PlanId, "free">} billing={billing} label={p.cta} dark={pro} />
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
          Cancel anytime · Secure checkout by <Ph value={site.pricingCopy.checkoutProvider} /> · <Ph value={site.pricingCopy.guarantee} />
        </span>
        <span className="pr-team">
          Need it for a team?{" "}
          <a href={isSet(site.pricingCopy.teamHref) ? site.pricingCopy.teamHref : "#"} className="pr-team-link">
            <Ph value={site.pricingCopy.teamCta} />
          </a>
        </span>
      </div>

      {site.socialProof.length > 0 && <Marquee />}

      {compareLoaded && <CompareDialog open={compare} onOpenChange={setCompare} />}
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
