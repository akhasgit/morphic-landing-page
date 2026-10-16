"use client";

import { AnimatePresence, m as motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Calendar, ChevronDown, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { metricKpis, monthName, type Metric } from "@/demo/data";
import type { Layout } from "./MorphStage";
import { Clutter, chromeIn, recT } from "./stage-presets";

// Pulseboard (pulseboard.demo) for MorphStage: a busy analytics dashboard ("original") that
// morphs into a chat you can ask about the numbers, plus a few concise charts ("chat").
// Shared layoutIds: kpi-{revenue|signups|churn} cards fly into stat chips and every month's
// revenue bar bar-{month} flies from the big chart into the compact one.

const KPIS = ["revenue", "signups", "churn"] as const;
type KpiId = (typeof KPIS)[number];
const KPI_LABEL: Record<KpiId, string> = { revenue: "Revenue", signups: "Signups", churn: "Avg churn" };
const KPI_DELTA: Record<KpiId, string> = { revenue: "▲ 12.5% vs last year", signups: "▲ 8.1% vs last year", churn: "▼ 0.4 pts vs last year" };

export function MetricLayouts({ layout, records, compact }: { layout: Layout; records: Metric[]; compact: boolean }) {
  return layout === "chat" ? <ChatView records={records} compact={compact} /> : <PulseOriginal records={records} />;
}

function KpiValue({ id, records }: { id: KpiId; records: Metric[] }) {
  const k = metricKpis(records);
  return <>{id === "revenue" ? k.revenue : id === "signups" ? k.signups : k.churn}</>;
}

// ───────────────────────────── original: the busy dashboard ─────────────────────────────

function PulseOriginal({ records }: { records: Metric[] }) {
  const max = Math.max(...records.map((m) => m.revenue));
  return (
    <div className="d-p-layer">
      <div className="d-p-kpis">
        {KPIS.map((id, i) => (
          <motion.div key={id} layoutId={`kpi-${id}`} className="d-p-kpi" transition={recT(i)}>
            <span className="d-p-kpi-label">{KPI_LABEL[id]}</span>
            <motion.span layoutId={`kpi-val-${id}`} layout="position" className="d-p-kpi-value" transition={recT(i)}>
              <KpiValue id={id} records={records} />
            </motion.span>
            <span className="d-p-kpi-delta">{KPI_DELTA[id]}</span>
          </motion.div>
        ))}
      </div>
      <div className="d-p-chart">
        <div className="d-p-bars">
          {records.map((m, i) => (
            <motion.span
              key={m.month}
              layoutId={`bar-${m.month}`}
              className="d-p-bar"
              style={{ height: `${(m.revenue / max) * 100}%` }}
              transition={recT(3 + i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Everything on the dashboard that isn't one of the records: it blurs out first. */
export function PulseboardClutter({ records }: { records: Metric[] }) {
  const k = metricKpis(records);
  return (
    <div className="d-clutter is-pulse">
      <Clutter className="d-c-top is-pulse">
        <span className="d-p-logo">
          <i /> Pulseboard
        </span>
        <span className="d-p-tabs">
          <b>Overview</b>
          <span>Revenue</span>
          <span>Customers</span>
          <span>Funnels</span>
          <span>Reports</span>
        </span>
        <span className="d-p-range">
          <Calendar /> Jan – Dec 2026 <ChevronDown />
        </span>
        <span className="d-p-export">Export</span>
        <span className="d-c-avatar" />
      </Clutter>
      <Clutter className="d-c-nav is-pulse">
        {["Overview", "Revenue", "Customers", "Funnels", "Cohorts", "Reports", "Settings"].map((l, i) => (
          <span key={l} className={i === 0 ? "is-on" : ""}>
            <i />
            {l}
          </span>
        ))}
      </Clutter>
      <Clutter className="d-p-banner">
        <span className="d-c-ad-tag">Pro</span>
        <span className="d-p-banner-copy">
          <b>Upgrade to Pulseboard Pro</b> — forecasting, alerts and 40+ widgets
        </span>
        <span className="d-p-banner-btn">Try free</span>
      </Clutter>
      {/* KPI card chrome that doesn't move: the 4th card, plus the grid it shares with the records */}
      <div className="d-p-kpis">
        <span />
        <span />
        <span />
        <Clutter className="d-p-kpi is-static">
          <span className="d-p-kpi-label">Best month</span>
          <span className="d-p-kpi-value">{k.bestMonth}</span>
          <span className="d-p-kpi-delta">by revenue</span>
        </Clutter>
      </div>
      <Clutter className="d-p-chart is-frame">
        <span className="d-p-chart-title">
          Revenue · monthly
          <em>
            <i /> Revenue <i className="is-b" /> Target
          </em>
        </span>
        <span className="d-p-grid">
          {[0, 1, 2, 3].map((g) => (
            <i key={g} />
          ))}
        </span>
        <span className="d-p-yaxis">
          <i>$300K</i>
          <i>$200K</i>
          <i>$100K</i>
          <i>$0</i>
        </span>
        <span className="d-p-xaxis">
          {records.map((m) => (
            <i key={m.month}>{m.month}</i>
          ))}
        </span>
      </Clutter>
      <Clutter className="d-p-table">
        <span className="d-p-table-title">Monthly breakdown</span>
        <span className="d-p-tr is-head">
          <i>Month</i>
          <i>Revenue</i>
          <i>Signups</i>
          <i>Churn</i>
        </span>
        {records.map((m) => (
          <span key={m.month} className="d-p-tr">
            <i>{m.month}</i>
            <i>${(m.revenue / 1000).toFixed(1)}K</i>
            <i>{m.signups.toLocaleString("en-US")}</i>
            <i>{m.churn.toFixed(1)}%</i>
          </span>
        ))}
      </Clutter>
      <Clutter className="d-p-toast">
        <b>What&rsquo;s new</b> Funnels 2.0 is here <ArrowUpRight />
      </Clutter>
    </div>
  );
}

// ───────────────────────────── chat: talk to the numbers ─────────────────────────────

const QUESTION = "Which month had the highest churn?";
const SUGGESTIONS = ["Best month for signups?", "Q4 vs Q1 revenue"];

function ChatView({ records, compact }: { records: Metric[]; compact: boolean }) {
  const reduced = useReducedMotion();
  const k = metricKpis(records);
  const top = k.worstChurn;
  const answer = `${monthName(top.month)} — ${top.churn}%, the highest of the year. It eased to ${k.lastChurn.churn}% by ${monthName(k.lastChurn.month)}.`;
  const words = answer.split(" ");
  const maxRev = Math.max(...records.map((m) => m.revenue));
  const maxChurn = top.churn;

  // In-page Q&A, once per mount: type → ask → stream the answer → highlight the bar it came from.
  const [typed, setTyped] = useState(0);
  const [asked, setAsked] = useState(!!reduced);
  const [shown, setShown] = useState(reduced ? words.length : 0);
  const [hl, setHl] = useState(!!reduced);
  useEffect(() => {
    if (reduced) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    for (let i = 1; i <= QUESTION.length; i++) at(900 + i * 25, () => setTyped(i));
    at(1900, () => {
      setTyped(0);
      setAsked(true);
    });
    words.forEach((_, i) => at(2200 + i * 45, () => setShown(i + 1)));
    at(2650, () => setHl(true));
    return () => timers.forEach(window.clearTimeout);
  }, [reduced, words.length]);

  return (
    <div className="d-chat" data-compact={compact || undefined}>
      <motion.div className="d-viewbar" {...chromeIn}>
        <span className="d-viewbar-dot" /> Ask about these numbers <span className="d-viewbar-n">pulseboard.demo</span>
      </motion.div>
      <div className="d-chat-body">
        <div className="d-chat-data">
          <div className="d-chat-stats">
            {KPIS.map((id, i) => (
              <motion.div key={id} layoutId={`kpi-${id}`} className="d-chat-stat" transition={recT(i)}>
                <span className="d-chat-stat-label">{KPI_LABEL[id]}</span>
                <motion.span layoutId={`kpi-val-${id}`} layout="position" className="d-chat-stat-value" transition={recT(i)}>
                  <KpiValue id={id} records={records} />
                </motion.span>
              </motion.div>
            ))}
          </div>
          <div className="d-chat-charts">
            <motion.div className="d-chat-chart" {...chromeIn}>
              <span className="d-chat-chart-title">Revenue</span>
            </motion.div>
            <motion.div className="d-chat-chart" {...chromeIn}>
              <span className="d-chat-chart-title">Churn</span>
            </motion.div>
            {/* bars sit above the chart cards so the shared-layout bars can fly straight in */}
            <div className="d-chat-bars is-rev">
              {records.map((m, i) => (
                <span key={m.month} className="d-chat-bar-col">
                  <motion.span layoutId={`bar-${m.month}`} className="d-chat-bar" style={{ height: `${(m.revenue / maxRev) * 100}%` }} transition={recT(3 + i)} />
                </span>
              ))}
            </div>
            <div className="d-chat-bars is-churn">
              {records.map((m, i) => (
                <span key={m.month} className="d-chat-bar-col">
                  <motion.span
                    className="d-chat-bar is-churn"
                    data-hl={(hl && m.month === top.month) || undefined}
                    style={{ height: `${(m.churn / maxChurn) * 100}%`, transformOrigin: "50% 100%" }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.55 + i * 0.03, type: "spring", stiffness: 220, damping: 24 }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
        <motion.div className="d-chat-thread" {...chromeIn}>
          <div className="d-chat-msgs">
            <div className="d-chat-a is-greet">
              <p>
                I read the {records.length} months on this page. Ask me anything about revenue, signups or churn.
              </p>
            </div>
            <AnimatePresence>
              {asked && (
                <motion.p key="q" className="d-chat-q" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  {QUESTION}
                </motion.p>
              )}
              {shown > 0 && (
                <motion.div key="a" className="d-chat-a" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p>{words.slice(0, shown).join(" ")}</p>
                  {hl && (
                    <motion.span className="d-chat-src" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.25 }}>
                      from the page → Monthly breakdown · {top.month}
                    </motion.span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="d-chat-sugg">
            {SUGGESTIONS.map((q) => (
              <span key={q}>{q}</span>
            ))}
          </div>
          <div className="d-chat-input">
            <span className={typed ? "is-typing" : ""}>{typed ? QUESTION.slice(0, typed) : "Ask about these numbers…"}</span>
            <i>
              <Send />
            </i>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
