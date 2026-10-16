import type { Metadata } from "next";
import { ShopwiseSite } from "@/components/playground/ShopwiseSite";

export const metadata: Metadata = { title: "shopwise — headphones", description: "Search results for trying Morphic." };

export default function Page() {
  return <ShopwiseSite />;
}
