"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { demoVideoConfigured } from "@/lib/links";
import { useOnceTrue } from "@/lib/hooks";
import { markMotionFeaturesReady, motionFeaturesReady } from "@/lib/motion-ready";
import { useUi } from "@/store/ui";
import { Toaster } from "./Toaster";

// Motion's animation/gesture/layout features arrive right after hydration, not in the landing
// bundle: <MotionFeatures> (a next/dynamic chunk) resolves the promise LazyMotion waits on.
const loadFeatures = () => motionFeaturesReady;
const MotionFeatures = dynamic(() => import("./MotionFeatures"), { ssr: false });

// Dialogs (Radix) load the first time they're opened.
const EmailSheet = dynamic(() => import("./EmailSheet").then((mod) => mod.EmailSheet), { ssr: false });
const VideoDialog = dynamic(() => import("./VideoDialog").then((mod) => mod.VideoDialog), { ssr: false });

/** Client-side app shell: lazy motion features, reduced-motion support, global sheets and toasts. */
export function Providers({ children }: { children: ReactNode }) {
  const showEmail = useOnceTrue(useUi((s) => s.emailOpen));
  const showVideo = useOnceTrue(useUi((s) => s.videoOpen));
  return (
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user">
        {children}
        <MotionFeatures onLoad={markMotionFeaturesReady} />
        {showEmail && <EmailSheet />}
        {showVideo && demoVideoConfigured && <VideoDialog />}
        <Toaster />
      </MotionConfig>
    </LazyMotion>
  );
}
