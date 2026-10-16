"use client";

import dynamic from "next/dynamic";
import { NearGate } from "../NearGate";

const UseCaseCarousel = dynamic(() => import("./UseCaseCarousel"), { ssr: false });

export function UseCasesVisual() {
  return (
    <NearGate>
      <UseCaseCarousel />
    </NearGate>
  );
}
