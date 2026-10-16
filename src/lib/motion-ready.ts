import type { FeatureBundle } from "motion/react";

// LazyMotion loads Motion's features after hydration. Until then, motion values bound in
// `style` don't render, so components that move them early (e.g. a #deep-link landing)
// re-apply once this resolves.
let resolve: (features: FeatureBundle) => void = () => {};
export const motionFeaturesReady = new Promise<FeatureBundle>((r) => (resolve = r));
export const markMotionFeaturesReady = (features: FeatureBundle) => resolve(features);
