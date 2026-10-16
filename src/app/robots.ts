import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { text } from "@/lib/placeholder";

export default function robots(): MetadataRoute.Robots {
  const base = text(site.url).replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dev/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
