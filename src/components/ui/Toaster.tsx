"use client";

import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useUi } from "@/store/ui";

export function Toaster() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div
      data-theme="dark"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(max(12px,env(safe-area-inset-bottom))+72px)] z-[95] flex flex-col items-center gap-2 px-4 lg:bottom-8"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[14px] text-ink"
            style={{ backgroundColor: "rgba(20,20,24,0.8)" }}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--success-bg)] text-success">
              <Check size={13} strokeWidth={3} />
            </span>
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
