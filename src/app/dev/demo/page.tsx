import type { Metadata } from "next";
import { DemoLab } from "./DemoLab";

export const metadata: Metadata = { title: "Demo engine lab — Morphic dev" };

export default function Page() {
  return <DemoLab />;
}
