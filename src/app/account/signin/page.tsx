import { redirect } from "next/navigation";
import { api, getServerConfig, safeNext, sessionToken } from "@/lib/account/server";
import { SignInButtons } from "./SignInButtons";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const next = safeNext((await searchParams).next);
  const token = await sessionToken();
  if (token && await api("/v1/me", { token }).then(() => true, () => false)) redirect(next);
  const config = await getServerConfig();
  return (
    <section className="acct-card acct-signin">
      <h1 className="acct-h1">Sign in to Morphic</h1>
      <p className="acct-sub">Use the same Google account as in the Morphic extension. Your plan, submitted commands and replies are linked to that account.</p>
      {config ? <SignInButtons googleClientId={config.googleClientId} devAuth={config.devAuth} next={next} /> : <p className="acct-banner acct-banner-warn">Morphic&rsquo;s server can&rsquo;t be reached right now. Try again in a moment.</p>}
    </section>
  );
}
