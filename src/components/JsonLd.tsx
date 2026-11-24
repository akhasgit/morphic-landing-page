import { faq } from "@/config/faq";
import { site } from "@/config/site";
import { text } from "@/lib/placeholder";

/** SoftwareApplication (BrowserApplication) + FAQPage structured data (§7.8, §13). */
export function JsonLd() {
  const offers = [{ "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" }];

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "BrowserApplication",
      operatingSystem: "Chrome",
      description:
        "Morphic is a Chrome extension that rebuilds any web page into the interface you describe, using the site's real, live data. Undo anything, anytime.",
      url: text(site.url),
      offers,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: text(f.a) },
      })),
    },
  ];

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
