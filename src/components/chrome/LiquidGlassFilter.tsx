/**
 * SVG filter used as a Chromium-only backdrop-filter on the progress pill (§6.5).
 * A displacement map that is neutral in the middle and bends toward the edges gives a
 * subtle liquid refraction where the glass meets the page. Browsers without
 * backdrop-filter: url() fall back to plain blur.
 */
export function LiquidGlassFilter() {
  // Edge map: red = horizontal push, green = vertical push. 50% grey = no displacement.
  const map =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" preserveAspectRatio="none">` +
        `<defs>` +
        `<linearGradient id="r" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#f00"/><stop offset=".22" stop-color="#800"/><stop offset=".78" stop-color="#800"/><stop offset="1" stop-color="#000"/></linearGradient>` +
        `<linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset=".12" stop-color="#080"/><stop offset=".88" stop-color="#080"/><stop offset="1" stop-color="#000"/></linearGradient>` +
        `</defs>` +
        `<rect width="100" height="100" fill="url(#r)"/>` +
        `<rect width="100" height="100" fill="url(#g)" style="mix-blend-mode:screen"/>` +
        `</svg>`,
    );
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="liquid-glass" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={map} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="10" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
