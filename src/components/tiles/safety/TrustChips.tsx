"use client";

import { AnimatePresence, m as motion } from "motion/react";
import { useState } from "react";
import { trust as chips } from "./trust";

/** Mobile: the trust list becomes four icon chips; tapping one shows its line (§7.5). */
export function TrustChips() {
  const [open, setOpen] = useState(0);
  return (
    <div className="sf-chips">
      <div className="sf-chips-row" role="tablist" aria-label="Why it's safe">
        {chips.map((c, i) => (
          <button key={c.title} type="button" role="tab" aria-selected={open === i} className="sf-chip" onClick={() => setOpen(i)}>
            <c.icon size={15} aria-hidden="true" />
            <span>{c.title}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p key={open} className="sf-chip-line" role="tabpanel" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <b>{chips[open].title}</b> — {chips[open].line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
