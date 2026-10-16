// Real <img> sources for the playground pages (Morphic extractors read img[src]).
// Same deterministic palette as the coded demos' <Thumb>; generated, no external images.
import { thumbColors } from "../demo/Thumb";

export function thumbDataUrl(seed: number, w = 640, h = 360, kind: "video" | "product" = "video") {
  const [a, b] = thumbColors(seed);
  const r = (k: number) => {
    const x = Math.sin(seed * 9301 + k * 49297) * 233280;
    return x - Math.floor(x);
  };
  const cx = Math.round(w * (0.2 + r(4) * 0.6));
  const cy = Math.round(h * (0.25 + r(5) * 0.5));
  const rad = Math.round(h * (0.18 + r(3) * 0.14));
  const shape =
    kind === "product"
      ? `<circle cx="${w / 2}" cy="${h * 0.48}" r="${h * 0.24}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="${h * 0.06}" stroke-dasharray="${h * 1.13} ${h * 0.4}" transform="rotate(160 ${w / 2} ${h * 0.48})"/>` +
        `<rect x="${w * 0.23}" y="${h * 0.52}" width="${w * 0.13}" height="${h * 0.22}" rx="${h * 0.04}" fill="#fff" fill-opacity=".9"/>` +
        `<rect x="${w * 0.64}" y="${h * 0.52}" width="${w * 0.13}" height="${h * 0.22}" rx="${h * 0.04}" fill="#fff" fill-opacity=".9"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#fff" fill-opacity=".28"/>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#g)"/>${shape}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
