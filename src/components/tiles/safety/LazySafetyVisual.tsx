"use client";

import dynamic from "next/dynamic";
import { NearGate } from "../NearGate";

const SafetyVisual = dynamic(() => import("./SafetyVisual"), { ssr: false });

export function LazySafetyVisual() {
  return (
    <NearGate>
      <SafetyVisual />
    </NearGate>
  );
}
