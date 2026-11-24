import { readFileSync } from "node:fs";

const required = ["MORPHIC_API_URL", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_CHROME_STORE_URL", "NEXT_PUBLIC_SUPPORT_EMAIL", "NEXT_PUBLIC_LEGAL_ENTITY"];
const issues = required.filter(key => !process.env[key]?.trim() || process.env[key].includes("{{")).map(key => `Missing ${key}`);
function publicUrl(key) {
  try {
    const url = new URL(process.env[key]);
    if (url.protocol === "https:" && !url.username && !url.password && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return url;
  } catch {}
  issues.push(`Invalid production ${key}`);
  return null;
}
const site = publicUrl("NEXT_PUBLIC_SITE_URL");
publicUrl("MORPHIC_API_URL");
const store = publicUrl("NEXT_PUBLIC_CHROME_STORE_URL");
if (store && (store.hostname !== "chromewebstore.google.com" || !/^\/detail\/(?:[^/]+\/)?[a-p]{32}\/?$/.test(store.pathname))) issues.push("Set the published Chrome Web Store detail URL");
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "")) issues.push("Set the public support email address");
for (const [route, key] of [["privacy", "MORPHIC_PRIVACY_POLICY_URL"], ["terms", "MORPHIC_TERMS_URL"]]) {
  if (process.env[key]) {
    const url = publicUrl(key);
    if (url && url.origin === site?.origin && url.pathname.replace(/\/$/, "") === `/${route}`) issues.push(`${key} redirects to itself`);
  } else if (readFileSync(`src/app/${route}/page.tsx`, "utf8").includes("Preview for testing")) {
    issues.push(`Publish reviewed /${route} content or configure ${key}`);
  }
}
if (issues.length) { console.error(issues.join("\n")); process.exit(1); }
console.log("Launch configuration is present. Verify installation, sign-in, billing and policy URLs on the deployed site.");
