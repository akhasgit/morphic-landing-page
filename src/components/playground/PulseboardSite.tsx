"use client";

import { useState } from "react";
import { metrics } from "@/demo/data";
import "./playground.css";

type Series = "revenue" | "signups" | "churn";

const fmt = {
  revenue: (n: number) => `$${(n / 1000).toFixed(1)}K`,
  signups: (n: number) => n.toLocaleString("en-US"),
  churn: (n: number) => `${n.toFixed(1)}%`,
};

/**
 * Pulseboard — a real DOM analytics dashboard for trying Morphic (§11 /playground), in the
 * spirit of test-website/index.html: KPI cards, a chart and the monthly table it's drawn from.
 */
export function PulseboardSite() {
  const [series, setSeries] = useState<Series>("revenue");
  const totalRevenue = metrics.reduce((s, m) => s + m.revenue, 0);
  const totalSignups = metrics.reduce((s, m) => s + m.signups, 0);
  const avgChurn = metrics.reduce((s, m) => s + m.churn, 0) / metrics.length;
  const best = metrics.reduce((a, b) => (b.revenue > a.revenue ? b : a));
  const values = metrics.map((m) => m[series]);
  const max = Math.max(...values);

  return (
    <div className="pg-pulse">
      <header className="pb-head">
        <span className="pb-logo">
          <span className="pb-logo-mark" /> Pulseboard
        </span>
        <nav aria-label="Main">
          <a href="#" className="is-on">
            Overview
          </a>
          <a href="#">Revenue</a>
          <a href="#">Customers</a>
          <a href="#">Reports</a>
        </nav>
        <span className="pb-avatar" aria-label="Account">
          JR
        </span>
      </header>
      <main className="pb-main">
        <div className="pb-title">
          <h1>Overview</h1>
          <span>Jan – Dec 2026</span>
        </div>
        <section className="pb-kpis" aria-label="Key metrics">
          <div className="pb-kpi" data-metric="revenue">
            <span className="pb-kpi-label">Total revenue</span>
            <span className="pb-kpi-value">${(totalRevenue / 1e6).toFixed(2)}M</span>
          </div>
          <div className="pb-kpi" data-metric="signups">
            <span className="pb-kpi-label">Signups</span>
            <span className="pb-kpi-value">{totalSignups.toLocaleString("en-US")}</span>
          </div>
          <div className="pb-kpi" data-metric="churn">
            <span className="pb-kpi-label">Avg. monthly churn</span>
            <span className="pb-kpi-value">{avgChurn.toFixed(1)}%</span>
          </div>
          <div className="pb-kpi" data-metric="best-month">
            <span className="pb-kpi-label">Best month</span>
            <span className="pb-kpi-value">{best.month}</span>
          </div>
        </section>

        <section className="pb-card" aria-label="Monthly chart">
          <div className="pb-card-head">
            <h2>Monthly {series}</h2>
            <div className="pb-tabs" role="tablist">
              {(["revenue", "signups", "churn"] as Series[]).map((s) => (
                <button key={s} type="button" role="tab" aria-selected={series === s} onClick={() => setSeries(s)}>
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <svg className="pb-chart" viewBox="0 0 600 220" role="img" aria-label={`Monthly ${series} bar chart`}>
            {metrics.map((m, i) => {
              const h = (m[series] / max) * 170;
              const x = 20 + i * 48;
              return (
                <g key={m.month}>
                  <rect x={x} y={190 - h} width={30} height={h} rx={4} />
                  <text x={x + 15} y={208} textAnchor="middle">
                    {m.month}
                  </text>
                </g>
              );
            })}
          </svg>
        </section>

        <section className="pb-card" aria-label="Monthly data">
          <h2>Monthly breakdown</h2>
          <table className="pb-table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Revenue</th>
                <th scope="col">Signups</th>
                <th scope="col">Churn</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.month} data-month={m.month}>
                  <td className="month">{m.month}</td>
                  <td className="revenue">{fmt.revenue(m.revenue)}</td>
                  <td className="signups">{fmt.signups(m.signups)}</td>
                  <td className="churn">{fmt.churn(m.churn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
