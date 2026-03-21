"use client";

import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/analytics";

export function AnalyticsConsentBanner() {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    setConsent(getAnalyticsConsent());
  }, []);

  if (consent) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[min(92vw,980px)] -translate-x-1/2 rounded-[28px] border border-brand-sand/60 bg-brand-ivory/95 p-5 shadow-[0_20px_50px_rgba(65,42,17,0.18)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-gold">Analytics consent</p>
          <h3 className="mt-2 font-serif text-2xl text-brand-brown">Allow analytics cookies?</h3>
          <p className="mt-2 text-sm leading-6 text-brand-warm">
            We use analytics to understand visits, campaign performance, add-to-cart behavior, and checkout drop-off so we can improve the store experience.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="brand-btn-outline px-5 py-3"
            onClick={() => {
              setAnalyticsConsent("denied");
              setConsent("denied");
            }}
          >
            Decline
          </button>
          <button
            type="button"
            className="brand-btn-primary px-5 py-3"
            onClick={() => {
              setAnalyticsConsent("granted");
              setConsent("granted");
            }}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
