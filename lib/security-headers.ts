const HEADER_LIST = [
  "Content-Security-Policy",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "X-DNS-Prefetch-Control",
  "Strict-Transport-Security",
] as const;

export function securityHeaders(): { key: string; value: string }[] {
  const script = ["'self'", "'unsafe-inline'", "https://va.vercel-scripts.com"];
  if (process.env.NODE_ENV !== "production") script.push("'unsafe-eval'");
  const csp = [
    "default-src 'self'",
    `script-src ${script.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "frame-src https://maps.google.com https://www.google.com https://www.google.com.tr https://maps.googleapis.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
  ].join("; ");
  const headers: { key: string; value: string }[] = [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
    { key: "X-DNS-Prefetch-Control", value: "off" },
  ];
  if (process.env.VERCEL === "1") {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=15552000" });
  }
  return headers;
}

export function applySecurityHeaders<T extends Response>(response: T): T {
  for (const header of securityHeaders()) {
    if (!response.headers.has(header.key)) response.headers.set(header.key, header.value);
  }
  return response;
}

export const securityHeaderNames = HEADER_LIST;
