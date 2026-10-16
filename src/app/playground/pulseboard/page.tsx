import type { Metadata } from "next";
import { PulseboardSite } from "@/components/playground/PulseboardSite";

export const metadata: Metadata = { title: "Pulseboard — Overview", description: "An analytics dashboard for trying Morphic." };

export default function Page() {
  return <PulseboardSite />;
}
