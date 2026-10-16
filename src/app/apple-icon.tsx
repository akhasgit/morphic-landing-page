import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const svg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="#6366F1"/><path d="M34 88V40l30 24-30 24z" fill="#fff" opacity="0.9"/><path d="M94 88V40L64 64l30 24z" fill="#fff" opacity="0.6"/><rect x="44" y="58" width="40" height="12" rx="6" fill="#fff" opacity="0.35"/></svg>`,
);

/** Apple touch icon from the extension's app icon (iOS rounds the corners itself). */
export default function AppleIcon() {
  return new ImageResponse(<img src={`data:image/svg+xml,${svg}`} width={180} height={180} alt="" />, size);
}
