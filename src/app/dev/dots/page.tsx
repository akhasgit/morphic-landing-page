import type { Metadata } from "next";
import { DotsLab } from "./DotsLab";

export const metadata: Metadata = { title: "Dot field lab — Morphic dev" };

export default function Page() {
  return <DotsLab />;
}
