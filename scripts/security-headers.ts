/* ============================================================
 * security-headers.ts — SINGLE SOURCE OF TRUTH
 * ------------------------------------------------------------
 * Every security header on the site is derived from this file.
 * Do NOT edit public/_headers or functions/_middleware.ts CSP
 * manually — they are generated. Run `npm run generate:headers`.
 *
 * Consumers:
 *   - scripts/generate-headers.ts  → public/_headers
 *   - scripts/generate-headers.ts  → functions/_security-headers.generated.ts
 *   - scripts/verify-headers.ts    → drift check in CI
 * ============================================================ */

/**
 * Header set applied to every response, static or dynamic.
 * CSP is intentionally excluded — it varies by route (nonce for HTML).
 */
export const BASE_SECURITY_HEADERS = {
  "Strict-Transport-Security":
    "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Cross-Origin-Resource-Policy": "same-origin",
} as const;

/**
 * CSP for static assets (images, JS, CSS, fonts).
 * No nonce, no strict-dynamic — these responses never execute
 * inline scripts, so an over-permissive CSP is just attack surface.
 */
export const STATIC_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/**
 * CSP for HTML (homepage, tools, 404, editor).
 * Uses nonce + strict-dynamic; framework-injected scripts inherit
 * trust from the parent script.
 */
export function buildHtmlCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://*.google.com https://*.doubleclick.net`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net",
    "connect-src 'self' blob: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net",
    "worker-src 'self' blob:",
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.doubleclick.net https://*.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/**
 * Complete static response header map (BASE + CSP).
 * Used by public/_headers.
 */
export const STATIC_RESPONSE_HEADERS: Record<string, string> = {
  ...BASE_SECURITY_HEADERS,
  "Content-Security-Policy": STATIC_CSP,
};

/**
 * Cloudflare Pages `_headers` file contents.
 * `/*` applies to all routes; `/assets/*` adds long-term cache.
 * Order matters: more-specific path rules should come after `/*`.
 */
export function renderHeadersFile(): string {
  const lines: string[] = ["/*"];
  for (const [k, v] of Object.entries(STATIC_RESPONSE_HEADERS)) {
    lines.push(`  ${k}: ${v}`);
  }
  lines.push("");
  lines.push("/assets/*");
  lines.push("  Cache-Control: public, max-age=31536000, immutable");
  lines.push("");
  return lines.join("\n");
}
