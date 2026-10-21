"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: "popup" | "redirect" }): void;
          renderButton(element: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
  }
}

/** Google Identity Services button (and a developer sign-in on local servers) → Morphic session cookie. */
export function SignInButtons({ googleClientId, devAuth, next }: { googleClientId: string | null; devAuth: boolean; next: string }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [gisReady, setGisReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const exchange = useCallback(
    async (body: { idToken: string } | { dev: true }) => {
      setStatus("Signing you in…");
      const response = await fetch("/account/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (response.ok) {
        window.location.assign(next);
        return;
      }
      const error = ((await response.json().catch(() => ({}))) as { error?: string }).error;
      setStatus(error ?? "Sign-in failed. Please try again.");
    },
    [next],
  );

  useEffect(() => {
    if (!gisReady || !googleClientId || !buttonRef.current || !window.google) return;
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: (response) => void exchange({ idToken: response.credential }), ux_mode: "popup" });
    window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: 300 });
  }, [gisReady, googleClientId, exchange]);

  return (
    <div className="acct-signin-buttons">
      {googleClientId ? (
        <>
          <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setGisReady(true)} onReady={() => setGisReady(true)} />
          <div ref={buttonRef} className="acct-gis" />
        </>
      ) : (
        <p className="acct-hint">Google sign-in isn&rsquo;t configured on this server yet.</p>
      )}
      {devAuth && (
        <button type="button" className="acct-btn" onClick={() => void exchange({ dev: true })}>
          Developer sign-in (local server)
        </button>
      )}
      {status && (
        <p className="acct-hint" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
