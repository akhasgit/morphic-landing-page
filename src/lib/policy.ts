/** The publisher may host its reviewed policies on a separate site. */
export function policyUrl(value: string | undefined, route: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const site = process.env.NEXT_PUBLIC_SITE_URL;
    if (site && url.origin === new URL(site).origin && url.pathname.replace(/\/$/, "") === route) return null;
    return url.href;
  } catch { return null; }
}
