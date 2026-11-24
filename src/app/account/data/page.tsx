import { param, requireAccount } from "@/lib/account/server";
import { deleteAccount } from "../actions";
export default async function DataPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAccount("/account/data");
  const error = param((await searchParams).error);
  return <><h1 className="acct-h1">Your data</h1>
    {error && <p className="acct-banner" role="alert">{error}</p>}
    <section className="acct-card"><h2>Export history</h2><p>Download your submitted commands, replies, timestamps, and the user, conversation, login session and request IDs attached to them.</p><a className="acct-btn" href="/account/export">Download JSON</a></section>
    <section className="acct-card"><h2>Delete account</h2><p>This removes your account, saved API key, and cloud conversations. Cancel any paid subscription and wait for it to end first. Stripe billing records and existing backups follow their separate retention policies. Remove local extension data by uninstalling the extension.</p>
    <form action={deleteAccount}><label htmlFor="confirm-delete">Type DELETE to confirm</label><input id="confirm-delete" name="confirmation" required pattern="DELETE" autoComplete="off" className="acct-input" /><button className="acct-btn" type="submit">Delete my account</button></form></section></>;
}
