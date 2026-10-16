import type { Metadata } from "next";
import { StreamlySite } from "@/components/playground/StreamlySite";

export const metadata: Metadata = { title: "Streamly — Home", description: "A video feed for trying Morphic." };

export default function Page() {
  return <StreamlySite />;
}
