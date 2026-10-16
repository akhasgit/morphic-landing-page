"use client";

// Motion's full feature set (animations, gestures, drag, layout/shared-layout). Loaded via
// next/dynamic right after hydration so it stays out of the landing bundle (§13).
import { domMax, type FeatureBundle } from "motion/react";
import { useEffect } from "react";

export default function MotionFeatures({ onLoad }: { onLoad: (features: FeatureBundle) => void }) {
  useEffect(() => onLoad(domMax), [onLoad]);
  return null;
}
