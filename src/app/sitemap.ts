import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { text } from "@/lib/placeholder";

/** Public, indexable pages. /welcome, /uninstall, /playground and /dev are noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = text(site.url).replace(/\/$/, "");
  const lastModified = new Date();
  return [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
