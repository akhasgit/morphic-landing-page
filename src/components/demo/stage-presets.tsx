"use client";

// Motion presets shared by every MorphStage dataset (§4.5 / §5.5): records move after clutter
// starts leaving with a 25ms stagger, clutter blurs out, new chrome enters last.
import { m as motion, type Transition } from "motion/react";
import type { ReactNode } from "react";

export const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;
/** Records move after clutter starts leaving, 25ms stagger (§4.5 morphs 600–900ms). */
export const recT = (i: number): Transition => ({ layout: { ...SPRING, delay: 0.1 + i * 0.025 } });
export const chromeIn = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.5, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};
export const clutterExit = {
  initial: { opacity: 0, scale: 0.96, filter: "blur(6px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.96, filter: "blur(6px)" },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
};
export const fadeIn = (i = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay: 0.32 + i * 0.02, duration: 0.3 },
});

/** A piece of the busy "before" page; exits with a blur when the view morphs. */
export function Clutter({ className, children, isStatic }: { className: string; children?: ReactNode; isStatic?: boolean }) {
  if (isStatic) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} {...clutterExit}>
      {children}
    </motion.div>
  );
}
