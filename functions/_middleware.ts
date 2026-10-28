/* ============================================================
 * Cloudflare Pages Middleware — SSR + Security Headers
 * ============================================================ */

import { TOOL_META, STATIC_META, type ToolMeta } from "./_data";
import { SSR_CONTENT } from "./_ssr-content";
import { SSR_SCHEMA } from "./_schema";

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

const SITE = "https://ahadex.online";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://*.google.com https://*.doubleclick.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net; connect-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.doubleclick.net https://*.google.com;",
};

/** Wrap ANY response with security headers */
function wrap(response: Response): Response {
  const h = new Headers(response.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!h.has(k)) h.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: h,
  });
}

function lookupMeta(path: string): ToolMeta | null {
  return TOOL_META[path] ?? STATIC_META[path] ?? null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(
  shell: string,
  path: string,
  meta: ToolMeta | null,
  ssrBody: string | null,
  schema: object | null
): string {
  let html = shell;

  if (meta) {
    const title = escapeHtml(meta.title);
    const desc = escapeHtml(meta.description);
    const canonical = `${SITE}${path === "/" ? "/" : path}`;
    const ogImage = meta.ogImage
      ? meta.ogImage.startsWith("http")
        ? meta.ogImage
        : `${SITE}${meta.ogImage}`
      : `${SITE}/images/og/default-og.png`;

    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
    html = html.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${desc}" />`
    );
    html = html.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}" />`
    );
    html = html.replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${title}" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${desc}" />`
    );
    html = html.replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${canonical}" />`
    );
    html = html.replace(
      /<meta property="og:image" content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${ogImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${ogImage}" />`
    );
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${title}" />`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${desc}" />`
    );

    if (schema) {
      const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");
      html = html.replace(
        /<\/head>/i,
        `  <script type="application/ld+json" data-ssr-schema="true">${jsonLd}</script>\n  </head>`
      );
    }
  }

  if (ssrBody) {
    html = html.replace(
      /<div id="root"\s*>\s*<\/div>/i,
      `<div id="root"><main data-ssr="true">${ssrBody}</main></div>`
    );
  }

  return html;
}

async function fetchAsset(
  env: Env,
  origin: string,
  path: string,
  req: Request
): Promise<Response | null> {
  try {
    const url = new URL(path, origin);
    const resp = await env.ASSETS.fetch(
      new Request(url.toString(), { method: "GET", headers: req.headers })
    );
    return resp.ok ? resp : null;
  } catch {
    return null;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  // 1. www → non-www (with headers)
  if (url.hostname === "www.ahadex.online") {
    const newUrl = new URL(url);
    newUrl.hostname = "ahadex.online";
    return wrap(Response.redirect(newUrl.toString(), 301));
  }

  // 2. Trailing slash → no trailing slash
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    const newUrl = new URL(url);
    newUrl.pathname = url.pathname.slice(0, -1);
    return wrap(Response.redirect(newUrl.toString(), 301));
  }

  // 3. Editor routes: noindex
  if (
    url.pathname.startsWith("/tools/cv-builder/edit/") ||
    url.pathname.startsWith("/tools/visiting-card/edit/")
  ) {
    const shell = await fetchAsset(context.env, url.origin, "/index.html", context.request);
    if (shell) {
      const headers = new Headers(shell.headers);
      headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      return wrap(new Response(shell.body, { status: 200, headers }));
    }
  }

  // 4. Known route → SSR rewrite
  const meta = lookupMeta(url.pathname);
  if (meta) {
    const shell = await fetchAsset(context.env, url.origin, "/index.html", context.request);
    if (shell) {
      const body = await shell.text();
      const ssrBody = SSR_CONTENT[url.pathname] ?? null;
      const schema = (SSR_SCHEMA[url.pathname] as object) ?? null;
      const rewritten = buildHtml(body, url.pathname, meta, ssrBody, schema);
      return wrap(
        new Response(rewritten, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        })
      );
    }
  }

  // 5. Direct asset (only for /assets/ or files with extension)
  const isAsset = url.pathname.startsWith("/assets/") || url.pathname.includes(".");
  if (isAsset) {
    const direct = await fetchAsset(context.env, url.origin, url.pathname, context.request);
    if (direct) return wrap(direct);
  }

  // 6. 404 fallback
  const shell = await fetchAsset(context.env, url.origin, "/index.html", context.request);
  if (shell) {
    return wrap(
      new Response(shell.body, {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      })
    );
  }

  // 7. Final fallback: pass-through with security headers
  const response = await context.next();
  return wrap(response);
};
