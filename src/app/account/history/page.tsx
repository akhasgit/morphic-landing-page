import Link from "next/link";
import { displayHistory } from "@/lib/history";
import { api, param, requireAccount } from "@/lib/account/server";
import { deleteConversation } from "../actions";
type Conversation = { id: string; title: string; origin: string; updatedAt: number };
type Event = { id: string; requestId: string; role: string; text: string; type: string; createdAt: number };
export default async function History({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await requireAccount("/account/history");
  const query = await searchParams;
  const selected = param(query.session);
  const before = param(query.before);
  const { conversations } = await api<{ conversations: Conversation[] }>(`/v1/conversations${before ? `?before=${encodeURIComponent(before)}` : ""}`, { token });
  const after = param(query.after);
  let events: Event[] = []; let error = param(query.error);
  if (selected) {
    try { events = (await api<{ events: Event[] }>(`/v1/conversations/${encodeURIComponent(selected)}/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`, { token })).events; }
    catch (e) { error = (e as Error).message; }
  }
  return <>
    <h1 className="acct-h1">Conversation history</h1>
    <p className="acct-hint">Commands and replies saved to your account. Open a new conversation in the extension to work on the current page.</p>
    {error && <p className="acct-banner" role="alert">{error}</p>}
    <section className="acct-card"><ul className="acct-list">{conversations.map(c => <li key={c.id}><Link href={`/account/history?session=${encodeURIComponent(c.id)}`}>{c.title}</Link><p className="acct-hint">{c.origin} · {new Date(c.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC</p></li>)}</ul>{!conversations.length && <p>No saved conversations yet.</p>}</section>
    {conversations.length === 50 && <Link href={`/account/history?before=${encodeURIComponent(`${conversations.at(-1)!.updatedAt}:${conversations.at(-1)!.id}`)}`}>Older conversations</Link>}
    {selected && <section className="acct-card">
      <h2>Saved messages</h2>
      {displayHistory(events).map(e => <div key={e.id} style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", marginBlock: e.type === "text" || e.type === "delta" ? 0 : 12 }}><span className="acct-hint">{e.type === "command" || e.type === "answer" ? "You: " : e.type === "outcome" ? "Status: " : ""}</span>{e.text}</div>)}
      {events.length === 100 && <p><Link href={`/account/history?session=${encodeURIComponent(selected)}&after=${encodeURIComponent(events.at(-1)!.id)}`}>Continue reading</Link></p>}
      <details><summary>Delete this conversation</summary><p>This removes its cloud messages. Saved page versions are separate.</p><form action={deleteConversation}><input type="hidden" name="sessionId" value={selected} /><button className="acct-btn" type="submit">Delete permanently</button></form></details>
    </section>}
  </>;
}
