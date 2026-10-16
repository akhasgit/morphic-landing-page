// Deterministic generated artwork (§5.2): a two-stop gradient from a curated palette plus one
// simple shape. Videos add a play glyph and a duration badge. No external images.

const PALETTE: [string, string][] = [
  ["#6D28D9", "#C4B5FD"], // violet
  ["#4338CA", "#A5B4FC"], // indigo
  ["#0F766E", "#5EEAD4"], // teal
  ["#B45309", "#FCD34D"], // amber
  ["#BE123C", "#FDA4AF"], // rose
  ["#334155", "#CBD5E1"], // slate
];
const SHAPES = ["circle", "ring", "triangle", "pill", "sun"] as const;

const rand = (seed: number, k: number) => {
  const x = Math.sin(seed * 9301 + k * 49297) * 233280;
  return x - Math.floor(x);
};

export function thumbColors(seed: number) {
  return PALETTE[seed % PALETTE.length];
}

export function Thumb({
  seed,
  kind = "video",
  duration,
  bare,
  className = "",
}: {
  seed: number;
  kind?: "video" | "product";
  duration?: string;
  /** Hide the play glyph and badge (circle grid, tiny table thumbs). */
  bare?: boolean;
  className?: string;
}) {
  const [a, b] = thumbColors(seed);
  const shape = SHAPES[Math.floor(rand(seed, 1) * SHAPES.length)];
  const angle = Math.round(rand(seed, 2) * 360);
  const size = 34 + rand(seed, 3) * 26; // % of the thumb's height
  const x = 18 + rand(seed, 4) * 64;
  const y = 22 + rand(seed, 5) * 56;
  const bg =
    kind === "product"
      ? `radial-gradient(120% 120% at 30% 20%, ${b} 0%, ${a} 100%)`
      : `linear-gradient(${angle}deg, ${a}, ${b})`;

  return (
    <div className={`d-thumb ${className}`} style={{ background: bg }} aria-hidden="true">
      {kind === "product" ? (
        <span className="d-prod-shape" />
      ) : (
        <span
          className={`d-shape d-shape-${shape}`}
          style={{ left: `${x}%`, top: `${y}%`, height: `${size}%`, transform: `translate(-50%, -50%) rotate(${Math.round(rand(seed, 6) * 40 - 20)}deg)` }}
        />
      )}
      {kind === "video" && !bare && (
        <>
          <span className="d-play" />
          {duration && <span className="d-dur">{duration}</span>}
        </>
      )}
    </div>
  );
}
