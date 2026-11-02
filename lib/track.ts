export type TrackType = "page_view" | "product_view" | "impression" | "card_click" | "whatsapp" | "phone" | "map";

export type TrackEvent = {
  type: TrackType;
  path?: string;
  product?: string;
  section?: string;
};

const SOURCES = ["direct", "google", "instagram", "facebook", "tiktok", "whatsapp", "bing", "yandex", "other"] as const;

const queue: TrackEvent[] = [];
let timer = 0;
let source = "";

function deviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function language() {
  const value = document.documentElement.lang.toLowerCase();
  if (value.startsWith("ar")) return "ar";
  if (value.startsWith("en")) return "en";
  return "tr";
}

function classifySource(referrer: string) {
  const params = new URLSearchParams(window.location.search);
  const utm = (params.get("utm_source") || "").toLowerCase();
  if (utm.includes("instagram")) return "instagram";
  if (utm.includes("facebook") || utm === "fb") return "facebook";
  if (utm.includes("tiktok")) return "tiktok";
  if (utm.includes("google")) return "google";
  if (utm.includes("whatsapp")) return "whatsapp";
  if (!referrer) return "direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
  if (!host || host === window.location.hostname) return "direct";
  if (host.includes("google.")) return "google";
  if (host.includes("instagram.") || host === "l.instagram.com") return "instagram";
  if (host.includes("facebook.") || host === "fb.com" || host.endsWith(".fb.me")) return "facebook";
  if (host.includes("tiktok.")) return "tiktok";
  if (host.includes("whatsapp.") || host === "wa.me") return "whatsapp";
  if (host.includes("bing.")) return "bing";
  if (host.includes("yandex.")) return "yandex";
  return "other";
}

function visitSource() {
  if (source) return source;
  try {
    const saved = sessionStorage.getItem("mg_src");
    if (saved && (SOURCES as readonly string[]).includes(saved)) {
      source = saved;
      return source;
    }
  } catch {
    // sessionStorage can be blocked. The label is not required.
  }
  source = classifySource(document.referrer);
  try {
    sessionStorage.setItem("mg_src", source);
  } catch {
    // Ignore storage failures.
  }
  return source;
}

export function flushTracking() {
  if (!queue.length) return;
  window.clearTimeout(timer);
  timer = 0;
  const events = queue.splice(0, 20);
  const body = JSON.stringify({
    events,
    language: language(),
    device: deviceType(),
    source: visitSource(),
  });
  const blob = new Blob([body], { type: "application/json" });
  if (navigator.sendBeacon?.("/api/analytics", blob)) return;
  fetch("/api/analytics", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => undefined);
}

export function track(event: TrackEvent) {
  if (window.location.pathname.startsWith("/admin")) return;
  queue.push(event);
  if (queue.length >= 12) flushTracking();
  else if (!timer) timer = window.setTimeout(flushTracking, 4000);
}

export function productSlugFromPath(path: string) {
  const match = /^\/(?:urun|paket)\/([^/?#]+)/.exec(path);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]).slice(0, 80);
  } catch {
    return match[1].slice(0, 80);
  }
}
