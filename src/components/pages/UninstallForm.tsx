"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { site } from "@/config/site";
import { isSet } from "@/lib/placeholder";

const reasons = ["Didn't work on my site", "Too slow", "Too expensive", "Just trying it"];

/** Uninstall feedback → site.uninstallFeedbackEndpoint (§11). */
export function UninstallForm() {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  if (state === "done") {
    return (
      <div className="mt-8 flex max-w-[560px] items-center gap-3 rounded-2xl border border-line bg-white p-5 text-[16px]">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--success-bg)] text-success">
          <Check size={18} />
        </span>
        Thank you — this genuinely helps us fix what went wrong.
      </div>
    );
  }

  return (
    <form
      className="un-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!reason && !details.trim()) return;
        setState("sending");
        try {
          if (isSet(site.uninstallFeedbackEndpoint)) {
            const res = await fetch(site.uninstallFeedbackEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ reason, details: details.trim() }),
            });
            if (!res.ok) throw new Error(String(res.status));
          } else {
            // TODO(AK): set site.uninstallFeedbackEndpoint — until then feedback is only logged.
            console.warn("site.uninstallFeedbackEndpoint is not set; feedback not sent.", { reason, details });
            await new Promise((r) => setTimeout(r, 500));
          }
          setState("done");
        } catch {
          setState("error");
        }
      }}
    >
      <fieldset className="contents">
        <legend className="sr-only">What didn&rsquo;t work?</legend>
        {reasons.map((r) => (
          <label key={r} className="un-option">
            <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
            {r}
          </label>
        ))}
      </fieldset>
      <label htmlFor="un-details" className="mt-3 text-[14px] font-medium text-ink">
        Anything else? <span className="font-normal text-ink-2">(optional)</span>
      </label>
      <textarea id="un-details" className="un-text" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={2000} />
      <div className="mt-2 flex items-center gap-3">
        <button type="submit" className="btn btn-primary btn-md" disabled={state === "sending" || (!reason && !details.trim())}>
          {state === "sending" ? <Loader2 className="animate-spin" size={18} /> : "Send feedback"}
        </button>
        {state === "error" && (
          <span className="text-[14px] text-danger" role="alert">
            That didn&rsquo;t send. Try again?
          </span>
        )}
      </div>
    </form>
  );
}
