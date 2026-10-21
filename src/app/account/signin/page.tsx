import { redirect } from "next/navigation";
import { getServerConfig, safeNext, sessionToken } from "@/lib/account/server";
import { SignInButtons } from "./SignInButtons";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const next = safeNext((await searchParams).next);
  if (await sessionToken()) redirect(next);
  const config = await getServerConfig();
  return (
    <section className="acct-card acct-signin">
      <h1 className="acct-h1">Sign in to Morphic</h1>
      <p className="acct-sub">Use the same Google account as in the Morphic extension. Your plan, usage and Anthropic key live here.</p>
      {config ? <SignInButtons googleClientId={config.googleClientId} devAuth={config.devAuth} next={next} /> : <p className="acct-banner acct-banner-warn">Morphic&rsquo;s server can&rsquo;t be reached right now. Try again in a moment.</p>}
    </section>
  );
}
