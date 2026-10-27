/* ============================================================
 * Cloudflare Pages Middleware — SSR meta + content injection
 * ------------------------------------------------------------
 * The site is a Vite + React SPA: dist/index.html has only a
 * <div id="root"> and no meaningful body content. Google and
 * AdSense reviewers prefer pages whose initial HTML contains
 * the real title, description, canonical, schema, and article
 * text — not just a JS mount point.
 *
 * This middleware closes that gap without a build-time route
 * generator:
 *
 *   1. www → non-www (301)
 *   2. trailing slash → no trailing slash (301)
 *   3. Fetch dist/index.html, then for every known route:
 *        - rewrite <title>
 *        - rewrite <meta name="description">
 *        - rewrite <link rel="canonical">
 *        - rewrite og:title / og:description / og:url / og:image
 *        - inject JSON-LD <script> from SSR_SCHEMA
 *        - inject SSR_CONTENT HTML inside <div id="root">
 *      So crawlers and no-JS clients see real content.
 *   4. /sitemap.xml, /ads.txt, etc. are served as static files.
 *   5. Unknown path → 404 fallback.
 *
 * All the content lives in three generated data files:
 *   functions/_data.ts          → titles + descriptions + OG
 *   functions/_ssr-content.ts   → <article> HTML per route
 *   functions/_schema.ts        → JSON-LD @graph per route
 * ============================================================ */

import { TOOL_META, STATIC_META, type ToolMeta } from "./_data";
import { SSR_CONTENT } from "./_ssr-content";
import { SSR_SCHEMA } from "./_schema";

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

const SITE = "https://ahadex.online";

/** Look up the meta for a path. Tools and static pages live in
 *  separate maps; both are keyed by full path with a leading / . */
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

/** Rewrite the SPA shell with route-specific SEO metadata and
 *  pre-rendered article content. */
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

    // <title>
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);

    // meta description
    html = html.replace(
      /<meta name="description" content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${desc}" />`
    );

    // canonical
    html = html.replace(
      /<link rel="canonical" href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}" />`
    );

    // og:title
    html = html.replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${title}" />`
    );
    // og:description
    html = html.replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${desc}" />`
    );
    // og:url
    html = html.replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${canonical}" />`
    );
    // og:image
    html = html.replace(
      /<meta property="og:image" content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${ogImage}" />`
    );

    // twitter:title
    html = html.replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${title}" />`
    );
    // twitter:description
    html = html.replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${desc}" />`
    );
    // twitter:image (fallback — index.html has one)
    html = html.replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:image" content="${ogImage}" />`
    );

    // Insert JSON-LD just before </head>
    if (schema) {
      const jsonLd = JSON.stringify(schema).replace(/</g, "\\u003c");
      html = html.replace(
        /<\/head>/i,
        `  <script type="application/ld+json" data-ssr-schema="true">${jsonLd}</script>\n  </head>`
      );
    }
  }

  // Inject SSR article body into the SPA mount point so that
  // non-JS crawlers see real content. React will replace it on
  // hydration, so there is no visual duplicate.
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

  // 1. www → non-www
  if (url.hostname === "www.ahadex.online") {
    const newUrl = new URL(url);
    newUrl.hostname = "ahadex.online";
    return Response.redirect(newUrl.toString(), 301);
  }

  // 2. Trailing slash → no trailing slash
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    const newUrl = new URL(url);
    newUrl.pathname = url.pathname.slice(0, -1);
    return Response.redirect(newUrl.toString(), 301);
  }

  // 3. Editor routes: let the SPA handle them untouched
  if (
    url.pathname.startsWith("/tools/cv-builder/edit/") ||
    url.pathname.startsWith("/tools/visiting-card/edit/")
  ) {
    const shell = await fetchAsset(context.env, url.origin, "/index.html", context.request);
    if (shell) {
      // No SSR injection for editor routes — noindex is set in _headers
      return shell;
    }
  }

  // 4. Known route → rewrite shell with route-specific SEO
  const meta = lookupMeta(url.pathname);
  if (meta) {
    const shell = await fetchAsset(
      context.env,
      url.origin,
      "/index.html",
      context.request
    );
    if (shell) {
      const body = await shell.text();
      const ssrBody = SSR_CONTENT[url.pathname] ?? null;
      const schema = (SSR_SCHEMA[url.pathname] as object) ?? null;
      const rewritten = buildHtml(body, url.pathname, meta, ssrBody, schema);
      return new Response(rewritten, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      });
    }
  }

  // 5. Direct file (sitemap.xml, ads.txt, assets, etc.)
  // Only fetch direct files if the path looks like an asset (has an extension
  // or starts with /assets/). This prevents Cloudflare's SPA fallback from
  // returning index.html with 200 for unknown routes.
  const isAsset = url.pathname.startsWith("/assets/") || url.pathname.includes(".");
  if (isAsset) {
    const direct = await fetchAsset(
      context.env,
      url.origin,
      url.pathname,
      context.request
    );
    if (direct) return direct;
  }

  // 6. 404 fallback — serve SPA shell (React renders NotFoundPage)
  const shell = await fetchAsset(
    context.env,
    url.origin,
    "/index.html",
    context.request
  );
  if (shell) {
    return new Response(shell.body, {
      status: 404,
      headers: shell.headers,
    });
  }

  return context.next();
};
