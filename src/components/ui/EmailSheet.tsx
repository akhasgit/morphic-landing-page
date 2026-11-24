"use client";
import { useState } from "react";
import { installUrl } from "@/lib/links";
import { useUi } from "@/store/ui";
import { Sheet } from "./Sheet";
export function EmailSheet() {
  const open = useUi(s => s.emailOpen); const setOpen = useUi(s => s.setEmailOpen);
  const [status, setStatus] = useState("");
  const url = installUrl("mobile");
  return <Sheet open={open} onOpenChange={setOpen} title="Install on desktop Chrome" description="Copy the link and open it on your computer.">
    {url ? <><input aria-label="Desktop installation link" readOnly value={url} className="w-full" /><button className="btn btn-primary" onClick={async () => { try { await navigator.clipboard.writeText(url); setStatus("Link copied"); } catch { setStatus("Select the link above to copy it"); } }}>Copy installation link</button></> : <p>The Chrome listing is not available yet.</p>}
    <p role="status">{status}</p>
  </Sheet>;
}
