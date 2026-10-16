"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { EmailSheet } from "./EmailSheet";
import { Toaster } from "./Toaster";
import { VideoDialog } from "./VideoDialog";

/** Client-side app shell: honours prefers-reduced-motion in every motion component. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <EmailSheet />
      <VideoDialog />
      <Toaster />
    </MotionConfig>
  );
}
