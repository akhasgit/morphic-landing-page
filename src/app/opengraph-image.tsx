import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = "Morphic — Tell any website how to look";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same palette as the coded demos' thumbnails.
const PALETTE = [
  ["#6D28D9", "#C4B5FD"],
  ["#4338CA", "#A5B4FC"],
  ["#0F766E", "#5EEAD4"],
  ["#B45309", "#FCD34D"],
  ["#BE123C", "#FDA4AF"],
  ["#334155", "#CBD5E1"],
];

/**
 * The hero's dot field, frozen: a square grid with dots pushed out of a hollow "lens" around
 * a cursor point, piling into a violet ring (same displacement → size/color mapping as §8.3).
 */
function dotField(w: number, h: number, lens: { x: number; y: number }) {
  const step = 18;
  const R = 150;
  let circles = "";
  for (let y = step / 2; y < h; y += step) {
    for (let x = step / 2; x < w; x += step) {
      const dx = x - lens.x;
      const dy = y - lens.y;
      const d = Math.hypot(dx, dy) || 1;
      let m = 0;
      if (d < R) m = Math.min(64, 62 * Math.pow(1 - d / R, 0.75));
      const px = x + (dx / d) * m;
      const py = y + (dy / d) * m;
      const t = Math.min(m / 24, 1);
      const r = 1.6 * (1 + Math.min(m / 18, 1.4));
      const col = `rgba(${Math.round(99 + 25 * t)},${Math.round(102 - 44 * t)},${Math.round(241 - 4 * t)},${(0.3 + 0.7 * t).toFixed(2)})`;
      circles += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(2)}" fill="${col}"/>`;
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<defs><radialGradient id="h"><stop offset="0" stop-color="#7C3AED" stop-opacity="0.16"/><stop offset="1" stop-color="#7C3AED" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="${lens.x}" cy="${lens.y}" r="200" fill="url(#h)"/>${circles}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600&display=swap")).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

/** OG image (§13): light dot field with a violet lens ring, the mark, the H1, a frozen circle-grid frame. */
export default async function OpengraphImage() {
  const [font, mark] = await Promise.all([loadFont(), readFile(join(process.cwd(), "public", site.brand.mark)).catch(() => null)]);
  const markSrc = mark ? `data:image/png;base64,${mark.toString("base64")}` : null;
  const field = dotField(size.width, size.height, { x: 300, y: 470 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(180deg, #F6F5FD, #ECEAF9)",
          fontFamily: font ? "Inter Tight" : "sans-serif",
        }}
      >
        <img src={field} width={size.width} height={size.height} alt="" style={{ position: "absolute", left: 0, top: 0 }} />

        <div style={{ position: "absolute", left: 72, top: 70, width: 540, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {markSrc && <img src={markSrc} width={64} height={51} alt="" />}
            <span style={{ fontSize: 38, fontWeight: 600, color: "#0A0A0B", letterSpacing: -1 }}>Morphic</span>
          </div>
          <div style={{ marginTop: 34, fontSize: 78, fontWeight: 600, lineHeight: 1, letterSpacing: -3, color: "#0A0A0B", display: "flex" }}>
            Tell any website how to look.
          </div>
        </div>

        {/* frozen circle-grid demo frame */}
        <div
          style={{
            position: "absolute",
            right: 64,
            top: 96,
            width: 470,
            height: 438,
            display: "flex",
            flexDirection: "column",
            borderRadius: 24,
            background: "#131316",
            border: "1px solid #27272A",
            boxShadow: "0 40px 90px -30px rgba(30,16,80,0.45)",
            overflow: "hidden",
          }}
        >
          <div style={{ height: 40, display: "flex", alignItems: "center", gap: 7, padding: "0 16px", borderBottom: "1px solid #222226" }}>
            {["#e9675f", "#e9b650", "#5fbf5a"].map((c) => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: 9999, background: c }} />
            ))}
            <div
              style={{
                marginLeft: 40,
                height: 22,
                width: 200,
                borderRadius: 11,
                background: "#1c1c20",
                color: "#c9c9d1",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                paddingLeft: 12,
              }}
            >
              streamly.demo
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: 22, padding: 26, background: "#FFFFFF" }}>
            {Array.from({ length: 12 }, (_, i) => {
              const [a, b] = PALETTE[(i * 5 + 1) % PALETTE.length];
              return (
                <div
                  key={i}
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: 9999,
                    background: `linear-gradient(${(i * 47) % 360}deg, ${a}, ${b})`,
                    boxShadow: "0 0 0 3px #fff, 0 0 0 5px rgba(99,102,241,0.22)",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Inter Tight", data: font, weight: 600, style: "normal" }] : undefined,
    },
  );
}
