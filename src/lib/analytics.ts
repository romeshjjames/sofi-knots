export type AnalyticsAttribution = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  landingPath: string;
};

type TrackEventInput = {
  eventName: string;
  path?: string;
  metadata?: Record<string, unknown>;
};

const SESSION_KEY = "sofi_analytics_session_id";
const ATTRIBUTION_KEY = "sofi_analytics_attribution";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = randomId();
  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

export function getStoredAttribution(): AnalyticsAttribution | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AnalyticsAttribution;
  } catch {
    return null;
  }
}

export function captureAttribution(search: string, path: string) {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmTerm = params.get("utm_term");
  const utmContent = params.get("utm_content");

  if (!utmSource && !utmMedium && !utmCampaign && !utmTerm && !utmContent) {
    return getStoredAttribution();
  }

  const attribution: AnalyticsAttribution = {
    source: utmSource || "direct",
    medium: utmMedium || "none",
    campaign: utmCampaign || "unassigned",
    term: utmTerm || "",
    content: utmContent || "",
    landingPath: path,
  };

  window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
}

export async function trackAnalyticsEvent({ eventName, path, metadata = {} }: TrackEventInput) {
  if (typeof window === "undefined") return;

  const sessionId = getAnalyticsSessionId();
  const attribution = getStoredAttribution();

  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId,
        eventName,
        path: path || window.location.pathname,
        referrer: document.referrer || null,
        attribution,
        metadata,
      }),
    });
  } catch {
    // Swallow analytics failures so storefront UX is never blocked.
  }
}
