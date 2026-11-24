"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export function Confirmation({ confirmed }: { confirmed: boolean }) {
  const router = useRouter();
  const [delayed, setDelayed] = useState(false);
  useEffect(() => {
    if (confirmed) return;
    const started = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - started >= 30_000) { clearInterval(timer); setDelayed(true); return; }
      if (document.visibilityState === "visible") router.refresh();
    }, 2000);
    return () => clearInterval(timer);
  }, [confirmed, router]);
  return <p className="acct-banner" role="status">{confirmed ? "Your subscription is confirmed." : delayed ? "Confirmation is delayed. Refresh this page or contact support if you completed checkout." : "Checking your subscription. Your plan changes only after payment confirmation."}</p>;
}
