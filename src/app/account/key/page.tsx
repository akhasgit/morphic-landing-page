import { param, requireAccount } from "@/lib/account/server";
import { removeKey, saveKey } from "../actions";

export default async function KeyPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const query = await searchParams;
  const { account } = await requireAccount("/account/key");
  const error = param(query.error);
  return (
    <>
      <h1 className="acct-h1">Anthropic key</h1>
      {param(query.saved) && (
        <div className="acct-banner acct-banner-ok" role="status">
          Saved. Anthropic accepted the key, and every browser where you&rsquo;re signed in to Morphic can use it.
        </div>
      )}
      {param(query.removed) && <div className="acct-banner">Removed. Runs on &ldquo;My Anthropic key&rdquo; will ask you to add one.</div>}
      {error && (
        <div className="acct-banner acct-banner-warn" role="alert">
          {error}
        </div>
      )}

      <section className="acct-card">
        <div className="acct-card-head">
          <h2>{account.key.present ? "Saved key" : "Add your key"}</h2>
          {account.key.present && <span className="acct-num">{account.key.hint}</span>}
        </div>
        <form action={saveKey} className="acct-key-form">
          <label htmlFor="apiKey" className="acct-hint">
            {account.key.present ? "Replace it with a new key" : "Paste an API key from console.anthropic.com → API keys"}
          </label>
          <div className="acct-row">
            <input id="apiKey" name="apiKey" type="password" className="acct-input" placeholder="sk-ant-…" autoComplete="off" spellCheck={false} required />
            <button className="acct-btn acct-btn-primary" type="submit">
              Save &amp; check
            </button>
          </div>
        </form>
        {account.key.present && (
          <form action={removeKey}>
            <button className="acct-btn acct-btn-danger" type="submit">
              Remove key
            </button>
          </form>
        )}
      </section>

      <section className="acct-card">
        <h2>How it&rsquo;s used</h2>
        <ul className="acct-list acct-includes">
          <li>Morphic checks the key with Anthropic, then stores it encrypted on its server. It&rsquo;s never shown again or kept in your browser.</li>
          <li>It&rsquo;s used only for your runs when you pick &ldquo;My Anthropic key&rdquo; in the extension&rsquo;s Settings.</li>
          <li>Those runs are billed to your Anthropic account and don&rsquo;t use your plan&rsquo;s morphs. Plan features still apply.</li>
        </ul>
      </section>
    </>
  );
}
