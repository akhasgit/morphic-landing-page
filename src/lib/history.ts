/** Assemble streaming chunks into readable messages; IDs/cursors still belong to the raw events. */
export function displayHistory<T extends { id: string; requestId: string; type: string; text: string }>(events: T[]): T[] {
  const messages: T[] = [];
  for (const event of events) {
    if (!["command", "text", "delta", "answer", "ask.user", "error", "outcome", "notice", "commit"].includes(event.type)) continue;
    const last = messages.at(-1);
    if (last && ["text", "delta"].includes(event.type) && ["text", "delta"].includes(last.type) && last.requestId === event.requestId) last.text += event.text;
    else messages.push({ ...event });
  }
  return messages;
}
