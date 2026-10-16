"use client";

import { AnimatePresence, motion } from "motion/react";
import { MousePointer2, Pin, Puzzle } from "lucide-react";
import { useEffect, useState } from "react";
import { AppIcon } from "../ui/AppIcon";

/** Animated puzzle → pin (§11 /welcome step 1). Loops: open menu, pin Morphic, icon lands in the toolbar. */
export function PinIllustration() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase(3);
      return;
    }
    const steps = [900, 1700, 2600, 4800];
    let ts: number[] = [];
    const run = () => {
      setPhase(0);
      ts = steps.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
    };
    run();
    const loop = window.setInterval(run, 5600);
    return () => {
      ts.forEach(window.clearTimeout);
      window.clearInterval(loop);
    };
  }, []);

  const menuOpen = phase === 1 || phase === 2;
  const pinned = phase >= 2;
  return (
    <div className="pin-ill" aria-hidden="true">
      <div className="pin-bar">
        <span className="pin-url" />
        <AnimatePresence>
          {phase >= 3 && (
            <motion.span key="icon" className="pin-icon" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
              <AppIcon size={18} />
            </motion.span>
          )}
        </AnimatePresence>
        <span className={`pin-icon ${menuOpen ? "is-hot" : ""}`}>
          <Puzzle size={15} />
        </span>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div className="pin-menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            <b>Extensions</b>
            <div className="pin-row is-target">
              <AppIcon size={16} />
              Morphic
              <Pin size={14} className={`pin-pin ${pinned ? "is-on" : ""}`} fill={pinned ? "currentColor" : "none"} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.span
        style={{ position: "absolute", color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.6))" }}
        animate={
          phase === 0
            ? { left: "40%", top: "70%" }
            : phase === 1
              ? { left: "calc(100% - 30px)", top: "26px" }
              : phase === 2
                ? { left: "calc(100% - 30px)", top: "86px" }
                : { left: "70%", top: "75%" }
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <MousePointer2 size={16} fill="#fff" />
      </motion.span>
    </div>
  );
}
