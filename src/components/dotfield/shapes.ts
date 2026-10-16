// Alpha masks the dot field forms shapes from (§8.3 "Logo formation", §11 404).

export type ShapeMask = { alpha: Uint8ClampedArray; w: number; h: number; aspect: number };

const MASK_H = 240;

function maskFromCanvas(canvas: HTMLCanvasElement): ShapeMask {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const alpha = new Uint8ClampedArray(canvas.width * canvas.height);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
  return { alpha, w: canvas.width, h: canvas.height, aspect: canvas.width / canvas.height };
}

const imageCache = new Map<string, Promise<ShapeMask>>();

/** Draws a transparent image (the ribbon mark) and keeps its alpha channel. */
export function loadImageMask(src: string): Promise<ShapeMask> {
  let p = imageCache.get(src);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight || 1;
        const canvas = document.createElement("canvas");
        canvas.height = MASK_H;
        canvas.width = Math.round(MASK_H * aspect);
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(maskFromCanvas(canvas));
      };
      img.onerror = reject;
      img.src = src;
    });
    imageCache.set(src, p);
  }
  return p;
}

/** Renders text (e.g. "404") in the display font and keeps its alpha. */
export function textMask(text: string, fontFamily: string, weight = 700): ShapeMask {
  const probe = document.createElement("canvas").getContext("2d")!;
  const font = `${weight} ${MASK_H}px ${fontFamily}`;
  probe.font = font;
  const m = probe.measureText(text);
  const ascent = m.actualBoundingBoxAscent || MASK_H * 0.72;
  const descent = m.actualBoundingBoxDescent || 0;
  const pad = 8;
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(m.width + pad * 2);
  canvas.height = Math.ceil(ascent + descent + pad * 2);
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.font = font;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, pad, pad + ascent);
  return maskFromCanvas(canvas);
}

/** Alpha (0–255) at normalized coordinates, bilinear-free nearest lookup. */
export function sampleMask(mask: ShapeMask, u: number, v: number): number {
  if (u < 0 || v < 0 || u >= 1 || v >= 1) return 0;
  return mask.alpha[Math.floor(v * mask.h) * mask.w + Math.floor(u * mask.w)];
}
