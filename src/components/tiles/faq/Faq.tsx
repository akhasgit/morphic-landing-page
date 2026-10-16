"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Accordion } from "radix-ui";
import { useState } from "react";
import { faq } from "@/config/faq";
import { cssVars } from "@/lib/css";
import { Ph } from "@/components/ui/Ph";
import { Sheet } from "@/components/ui/Sheet";

/**
 * Desktop: a two-column accordion with single-open behavior across both columns (two Radix
 * roots sharing one controlled value). Mobile: a list; each answer opens in a glass sheet.
 */
export function Faq() {
  const [open, setOpen] = useState<string>("");
  const [sheet, setSheet] = useState<number | null>(null);
  const columns = [faq.slice(0, 4), faq.slice(4)];

  return (
    <>
      <div className="faq-cols">
        {columns.map((col, c) => (
          <Accordion.Root
            key={c}
            type="single"
            collapsible
            className="faq-col"
            value={col.some((_, i) => `q${c * 4 + i}` === open) ? open : ""}
            onValueChange={(v) => setOpen(v)}
          >
            {col.map((item, i) => {
              const id = `q${c * 4 + i}`;
              return (
                <Accordion.Item key={id} value={id} className="faq-item reveal" style={cssVars({ i: 1 + c * 4 + i })}>
                  <Accordion.Header asChild>
                    <h3>
                      <Accordion.Trigger className="faq-trigger">
                        <span>{item.q}</span>
                        <ChevronDown className="faq-chev" size={18} aria-hidden="true" />
                      </Accordion.Trigger>
                    </h3>
                  </Accordion.Header>
                  <Accordion.Content className="faq-content">
                    <p className="faq-answer">
                      <Ph value={item.a} />
                    </p>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        ))}
      </div>

      <ul className="faq-list">
        {faq.map((item, i) => (
          <li key={item.q} className="reveal" style={cssVars({ i: 1 + i })}>
            <button type="button" className="faq-list-btn" onClick={() => setSheet(i)}>
              <span>{item.q}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <Sheet open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)} title={sheet !== null ? faq[sheet].q : ""}>
        {sheet !== null && (
          <p className="pb-2 text-[16px] leading-relaxed text-ink-2">
            <Ph value={faq[sheet].a} />
          </p>
        )}
      </Sheet>
    </>
  );
}
