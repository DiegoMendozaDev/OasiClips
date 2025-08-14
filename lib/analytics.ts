// lib/analytics.ts
export type AnalyticsEvent = {
  name: string;
  params?: Record<string, any>;
  nonInteraction?: boolean;
};

function safeWindow() {
  return typeof window !== "undefined" ? window : undefined;
}

export function isAnalyticsAllowed(): boolean {
  try {
    const w = safeWindow() as any;
    if (w && typeof w.__analyticsAllowed !== "undefined") {
      return Boolean(w.__analyticsAllowed);
    }
    const raw = safeWindow()?.localStorage?.getItem("analytics_consent");
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch (e) {
    // ignore
  }
  return false;
}

export function setAnalyticsAllowed(value: boolean) {
  try {
    const w = safeWindow() as any;
    if (w) w.__analyticsAllowed = Boolean(value);
    safeWindow()?.localStorage?.setItem(
      "analytics_consent",
      value ? "true" : "false"
    );
  } catch (e) {
    // ignore
  }
}

function sendToGTag(event: AnalyticsEvent) {
  const w = safeWindow();
  if (!w || !(w as any).gtag) return false;
  try {
    (w as any).gtag("event", event.name, event.params || {});
    return true;
  } catch {
    return false;
  }
}

function sendToDataLayer(event: AnalyticsEvent) {
  const w = safeWindow();
  if (!w || !(w as any).dataLayer) return false;
  try {
    (w as any).dataLayer.push({ event: event.name, ...event.params });
    return true;
  } catch {
    return false;
  }
}

function sendToPlausible(event: AnalyticsEvent) {
  const w = safeWindow();
  if (!w || !(w as any).plausible) return false;
  try {
    (w as any).plausible(event.name, { props: event.params || {} });
    return true;
  } catch {
    return false;
  }
}

async function sendToServer(event: AnalyticsEvent) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: event.name,
        params: event.params || {},
        ts: Date.now(),
      }),
      keepalive: true,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * trackEvent: wrapper principal
 * opts:
 *  - server?: boolean -> también enviar a /api/analytics (fire & forget)
 *  - force?: boolean  -> ignorar guard de consentimiento (usarlo solo si estás seguro)
 */
export async function trackEvent(
  event: AnalyticsEvent,
  opts?: { server?: boolean; force?: boolean }
) {
  if (typeof window === "undefined") return false;

  if (!opts?.force && !isAnalyticsAllowed()) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(
        "[analytics:blocked] consent not given:",
        event.name,
        event.params
      );
    }
    return false;
  }

  let handled = false;
  handled = sendToDataLayer(event) || handled;
  handled = sendToGTag(event) || handled;
  handled = sendToPlausible(event) || handled;

  if (opts?.server) {
    void sendToServer(event);
  }

  if (!handled && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[analytics:fallback]", event);
  }

  return handled;
}
