"use client";

import dynamic from "next/dynamic";
import { NearGate } from "../NearGate";

const SameDataDemo = dynamic(() => import("./SameDataDemo"), { ssr: false });

export function LazySameDataDemo() {
  return (
    <NearGate>
      <SameDataDemo />
    </NearGate>
  );
}
