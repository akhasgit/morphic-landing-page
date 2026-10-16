// Helpers for {{placeholder}} values in src/config.
// `text()` renders the inside of the braces (minus "(verify)" flags) so previews read
// naturally; `isSet()` tells features like the video dialog whether a value is real.

const BRACES = /\{\{([\s\S]*?)\}\}/g;
const VERIFY = /\s*\(verify\)/gi;

export function hasPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.includes("{{");
}

/** "Chrome {{and Edge (verify)}}" → "Chrome and Edge" */
export function text(value: string): string {
  return value.replace(BRACES, (_, inner: string) => inner).replace(VERIFY, "").replace(/\s{2,}/g, " ").trim();
}

/** A value is "set" once it has real content and no braces left. */
export function isSet(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim() !== "" && !value.includes("{{");
}

/** Numeric placeholder ("{{15}}") → 15. */
export function num(value: string | number): number {
  if (typeof value === "number") return value;
  const n = Number(text(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Walks a config object and returns "path → value" for every string that still has braces. */
export function findPlaceholders(obj: unknown, path = ""): { path: string; value: string }[] {
  if (typeof obj === "string") return hasPlaceholder(obj) ? [{ path, value: obj }] : [];
  if (Array.isArray(obj)) return obj.flatMap((v, i) => findPlaceholders(v, `${path}[${i}]`));
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([k, v]) => findPlaceholders(v, path ? `${path}.${k}` : k));
  }
  return [];
}
