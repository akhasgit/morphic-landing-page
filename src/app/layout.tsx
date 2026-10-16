import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { site } from "@/config/site";
import { text } from "@/lib/placeholder";
import { LiquidGlassFilter } from "@/components/chrome/LiquidGlassFilter";
import { AnalyticsScript } from "@/components/ui/AnalyticsScript";
import { Providers } from "@/components/ui/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-inter-tight", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

const title = "Morphic — Tell any website how to look";
const description =
  "Morphic is a Chrome extension that rebuilds any web page into the interface you describe, using the site's real, live data. Undo anything, anytime.";

export const metadata: Metadata = {
  metadataBase: new URL(text(site.url)),
  title,
  description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.name, title, description, url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F6F5FD",
};

/**
 * Runs before first paint:
 * - data-intro="play" once per session on the homepage hero (§7.1 first-visit intro);
 *   the CSS word-rise and the dot-field "M" burst key off it. Reduced motion or a deep
 *   link skips it.
 * - data-liquid on Chromium enables the SVG backdrop refraction on the progress pill.
 */
const bootScript = `(function(){var d=document.documentElement;try{var u=navigator.userAgentData;if(u&&u.brands&&u.brands.some(function(b){return /Chromium/.test(b.brand)}))d.setAttribute('data-liquid','');var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;var top=!location.hash||location.hash==='#intro';if(location.pathname==='/'&&top&&!rm&&!sessionStorage.getItem('morphic:intro')){sessionStorage.setItem('morphic:intro','1');d.setAttribute('data-intro','play')}else d.setAttribute('data-intro','done')}catch(e){d.setAttribute('data-intro','done')}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <LiquidGlassFilter />
        <Providers>{children}</Providers>
        <AnalyticsScript />
      </body>
    </html>
  );
}
