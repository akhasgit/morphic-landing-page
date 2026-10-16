// The extension's app icon (indigo rounded square, white glyph) — same paths as
// extension/static/icons/icon.svg so the site and the panel match exactly.
export function AppIcon({ size = 24, className, bar = true }: { size?: number; className?: string; bar?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" className={className} aria-hidden="true">
      <rect width="128" height="128" rx="28" fill="#6366F1" />
      <path d="M34 88V40l30 24-30 24z" fill="#fff" opacity="0.9" />
      <path d="M94 88V40L64 64l30 24z" fill="#fff" opacity="0.6" />
      {bar && <rect x="44" y="58" width="40" height="12" rx="6" fill="#fff" opacity="0.35" />}
    </svg>
  );
}
