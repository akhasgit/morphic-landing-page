"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { isSet } from "@/lib/placeholder";
import { useUi } from "@/store/ui";
import { Sheet } from "./Sheet";

async function submitEmail(email: string, source: string) {
  if (!isSet(site.emailCaptureEndpoint)) {
    // TODO(AK): set site.emailCaptureEndpoint — until then the sheet only simulates success.
    console.warn("site.emailCaptureEndpoint is not set; email not sent.");
    await new Promise((r) => setTimeout(r, 700));
    return true;
  }
  const res = await fetch(site.emailCaptureEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, source, page: window.location.href }),
  });
  return res.ok;
}

/** Mobile visitors: "Get the link" → email → "Check your inbox on your computer." (§10) */
export function EmailSheet() {
  const open = useUi((s) => s.emailOpen);
  const source = useUi((s) => s.emailSource);
  const setOpen = useUi((s) => s.setEmailOpen);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [email, setEmail] = useState("");

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(() => setState((s) => (s === "done" ? "idle" : s)), 300);
      }}
      title={state === "done" ? "Check your inbox on your computer." : "Morphic lives in desktop Chrome"}
      description={
        state === "done"
          ? "Open the email there and add Morphic in one click."
          : "Leave your email and we'll send you the link to open on your computer."
      }
    >
      {state === "done" ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface/60 p-4 text-[15px] text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--success-bg)] text-success">
            <Check size={18} />
          </span>
          Link sent to <span className="truncate font-medium">{email}</span>
        </div>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (state === "sending") return;
            setState("sending");
            try {
              const ok = await submitEmail(email.trim(), source);
              if (ok) track("email_capture", { tile: source });
              setState(ok ? "done" : "error");
            } catch {
              setState("error");
            }
          }}
        >
          <label className="sr-only" htmlFor="email-capture">
            Email address
          </label>
          <input
            id="email-capture"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-[10px] border border-line-strong bg-surface/70 px-4 text-[16px] text-ink outline-none placeholder:text-ink-3 focus:border-accent"
          />
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={state === "sending"}>
            {state === "sending" ? <Loader2 className="animate-spin" size={18} /> : "Send me the link"}
          </button>
          {state === "error" && (
            <p className="text-[13.5px] text-danger" role="alert">
              That didn't go through. Check the address and try again.
            </p>
          )}
        </form>
      )}
    </Sheet>
  );
}
