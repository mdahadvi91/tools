/* ============================================================
 * scripts/generate-ssr.ts
 * ------------------------------------------------------------
 * Single source of truth: src/data/tools.ts
 *
 * Generates all Cloudflare Pages SSR artifacts:
 *   functions/_ssr-content.ts  → <article> HTML per route
 *   functions/_data.ts         → route title/description/og
 *   functions/_schema.ts       → JSON-LD graph per route
 *   public/sitemap.xml         → sitemap with image extensions
 *   public/robots.txt          → robots rules pointing to sitemap
 *
 * Run: npm run generate:ssr
 * ============================================================ */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const ogImagePaths: Record<string, string> = {};

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { tools, TOOL_CATEGORIES, CATEGORY_LABEL, CATEGORY_ICON, TOOL_COUNT } from "../src/data/tools";
import type { Tool, ToolCategory } from "../src/types/tool";
import { STATIC_SSR_CONTENT } from "./static-content";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE = "https://ahadex.online";
// Use a static date for static pages. Update this manually when you change
// the content of about, privacy, terms, etc.
const STATIC_LASTMOD = "2026-10-20";
const GEN_DATE = new Date().toISOString().slice(0, 10);

/* ---------- helpers ---------- */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonToTsFile(header: string, exportName: string, obj: unknown): string {
  const json = JSON.stringify(obj, null, 2);
  return `${header}\n\nexport const ${exportName}: Record<string, any> = ${json};\n`;
}

function groupByCategory(): Record<ToolCategory, Tool[]> {
  const g = {} as Record<ToolCategory, Tool[]>;
  for (const c of TOOL_CATEGORIES) g[c] = [];
  for (const t of tools) g[t.category].push(t);
  return g;
}

/* ---------- SSR HTML — tool page ---------- */
function renderToolPage(t: Tool): string {
  const out: string[] = [];
  out.push(`<article>`);
  out.push(`  <h1>${esc(t.name)}</h1>`);
  out.push(`  <p><strong>${esc(t.description)}</strong></p>`);
  out.push(`  <p>${esc(t.longDescription)}</p>`);
  out.push(
    `  <p class="privacy-notice"><strong>Privacy:</strong> Processed locally in your browser. Files are not transmitted. <a href="/privacy">Full policy</a></p>`
  );

  for (const e of t.editorialContent ?? []) {
    out.push(`  <section><h2>${esc(e.heading)}</h2>\n    ${e.body}\n  </section>`);
  }

  if (t.features.length) {
    out.push(`  <h2>Features</h2>`);
    out.push(`  <ul>`);
    for (const f of t.features) {
      out.push(`    <li><strong>${esc(f.title)}</strong>: ${esc(f.description)}</li>`);
    }
    out.push(`  </ul>`);
  }

  if (t.howTo.length) {
    out.push(`  <h2>How to use ${esc(t.name)}</h2>`);
    out.push(`  <ol>`);
    for (const h of t.howTo) {
      out.push(`    <li><strong>${esc(h.title)}</strong>: ${esc(h.description)}</li>`);
    }
    out.push(`  </ol>`);
  }

  if (t.faq.length) {
    out.push(`  <h2>Frequently asked questions</h2>`);
    for (const q of t.faq) {
      out.push(`  <div><h3>${esc(q.question)}</h3><p>${esc(q.answer)}</p></div>`);
    }
  }

  if (t.useCases?.length) {
    out.push(`  <h2>Real-world use cases</h2>`);
    out.push(`  <ul>`);
    for (const u of t.useCases) out.push(`    <li>${esc(u)}</li>`);
    out.push(`  </ul>`);
  }

  if (t.supportedFormats?.length) {
    out.push(`  <h2>Supported Formats</h2>`);
    out.push(`  <ul>`);
    for (const f of t.supportedFormats) out.push(`    <li>${esc(f)}</li>`);
    out.push(`  </ul>`);
  }

  if (t.limitations?.length) {
    out.push(`  <h2>Limitations</h2>`);
    out.push(`  <ul>`);
    for (const l of t.limitations) out.push(`    <li>${esc(l)}</li>`);
    out.push(`  </ul>`);
  }

  for (const d of t.deepDive ?? []) {
    out.push(`  <section><h2>${esc(d.heading)}</h2>\n    ${d.body}\n  </section>`);
  }

  const related = t.relatedTools
    .map((id) => tools.find((x) => x.id === id))
    .filter((x): x is Tool => Boolean(x));
  if (related.length) {
    out.push(`  <h2>Related tools</h2>`);
    out.push(`  <ul>`);
    for (const r of related) {
      out.push(`    <li><a href="${r.path}">${esc(r.name)}</a> — ${esc(r.description)}</li>`);
    }
    out.push(`  </ul>`);
  }

  out.push(`</article>`);
  return out.join("\n");
}

/* ---------- SSR HTML — homepage ---------- */
function renderHomepage(): string {
  const byCategory = groupByCategory();
  const catList = TOOL_CATEGORIES.map(
    (c) =>
      `    <li><strong>${CATEGORY_LABEL[c]}</strong> — ${byCategory[c].length} tool${byCategory[c].length === 1 ? "" : "s"}.</li>`
  ).join("\n");

  const toolList = tools
    .slice()
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0))
    .map((t) => `    <li><a href="${t.path}">${esc(t.name)}</a> — ${esc(t.description)}</li>`)
    .join("\n");

  return `<article>
  <h1>AHADEX Tools — Free browser tools that never upload your files</h1>
  <p><strong>AHADEX Tools is a growing collection of free browser utilities. Right now it offers ${TOOL_COUNT} tools — ${tools.map((t) => t.name).join(", ")}. Every tool runs entirely inside your browser. Your files and tool input are processed locally and are not transmitted to our servers or stored anywhere. (Anonymous analytics and advertising scripts load separately — see the Privacy Policy for details.)</strong></p>

  <h2>What AHADEX Tools does</h2>
  <p>The site currently offers ${TOOL_COUNT} browser-based utilities across ${TOOL_CATEGORIES.length} categories:</p>
  <ul>
${catList}
  </ul>

  <h2>Every tool at a glance</h2>
  <ul>
${toolList}
  </ul>

  <h2>How the tools work</h2>
  <p>Every tool is written in JavaScript and runs entirely in your browser using standard web APIs — the HTML5 Canvas API for images, client-side libraries like jsPDF for PDF generation, and standard QR encoders for codes. When you upload a file, the file is read into memory by your browser and never travels over the network. You can verify this yourself: open your browser's developer tools, switch to the Network tab, and use any tool. You will see zero outbound file-upload requests. Once the required tool assets are loaded, your files are processed locally in the browser and are never transmitted to any server.</p>

  <h2>Why browser-based matters</h2>
  <p>Most online tools upload your files to a server. For passport photos, contracts, medical records, ID scans, and unreleased design work, that means a copy of your file sits on someone else's computer for minutes, hours, or longer. Some services claim to delete files immediately. Even so, the file has already been transmitted. AHADEX Tools avoids that entire class of risk by never sending anything anywhere.</p>

  <h2>Who AHADEX Tools is for</h2>
  <ul>
    <li><strong>Job seekers</strong> — build a professional, ATS-friendly CV and download it as a selectable-text PDF.</li>
    <li><strong>Freelancers and small business owners</strong> — design a print-ready visiting card without installing design software.</li>
    <li><strong>Anyone sharing a contact link</strong> — add a scannable QR badge to a photo for WhatsApp, WiFi, Instagram, or a vCard.</li>
    <li><strong>Anyone who values privacy</strong> — anyone who would rather not hand their documents to an unknown server.</li>
  </ul>

  <h2>Frequently asked questions</h2>
  <div>
    <h3>Is AHADEX Tools really free?</h3>
    <p>Yes. Every tool is free to use without an account or watermark. File size limits vary depending on the specific tool and your browser's memory. The site is supported by advertising shown outside the tool workspaces.</p>
  </div>
  <div>
    <h3>Do you upload my files to a server?</h3>
    <p>No. Every tool runs entirely in your browser. Files are read locally, processed locally, and never transmitted. You can verify this by checking your browser's developer tools while using any tool.</p>
  </div>
  <div>
    <h3>Do I need to create an account?</h3>
    <p>No. There is no signup, no email, and no login. You can use every tool immediately.</p>
  </div>
  <div>
    <h3>Does it work on mobile phones and tablets?</h3>
    <p>Yes. Every tool is fully responsive and tested on iOS Safari, Android Chrome, Firefox for Android, and Samsung Internet.</p>
  </div>
  <div>
    <h3>Do you collect analytics?</h3>
    <p>We use anonymous analytics (page views and tool opens) to understand which tools are useful. We never see your files or the text you enter into a tool. You can block analytics without affecting any tool.</p>
  </div>
  <div>
    <h3>How can I report a bug or request a feature?</h3>
    <p>Email <a href="mailto:mdahadvi91@gmail.com">mdahadvi91@gmail.com</a> or open an issue on <a href="https://github.com/mdahadvi91/tools">GitHub</a>.</p>
  </div>
</article>`;
}

/* ---------- SSR HTML — /tools page ---------- */
function renderToolsPage(): string {
  const byCategory = groupByCategory();
  const sections = TOOL_CATEGORIES.map((c) => {
    const list = byCategory[c];
    const items = list.length
      ? list.map((t) => `    <li><a href="${t.path}">${esc(t.name)}</a> — ${esc(t.description)}</li>`).join("\n")
      : `    <li><em>No tools in this category yet.</em></li>`;
    return `  <h2>${CATEGORY_LABEL[c]} (${list.length})</h2>\n  <ul>\n${items}\n  </ul>`;
  }).join("\n\n");

  return `<article>
  <h1>All Tools — ${TOOL_COUNT} free browser-based utilities</h1>
  <p><strong>AHADEX Tools currently offers ${TOOL_COUNT} browser-based utilities for ${TOOL_CATEGORIES.map((c) => CATEGORY_LABEL[c].toLowerCase()).join(", ")}. Every tool runs entirely in your browser — no server transmission, no accounts, no watermarks.</strong></p>

${sections}

  <h2>Why our tools are different</h2>
  <p>Every AHADEX tool runs entirely in your browser using modern web APIs. This means:</p>
  <ul>
    <li><strong>No uploads:</strong> Your files never travel over the network.</li>
    <li><strong>No account required:</strong> There is no signup, no email verification, no login.</li>
    <li><strong>No watermarks:</strong> The output is exactly what you processed.</li>
    <li><strong>No file-size upsell:</strong> There are no "premium" limits to unlock.</li>
    <li><strong>Works offline:</strong> Once the page loads, Wi-Fi can be turned off and the tool still works.</li>
  </ul>

  <h2>How we compare to typical online tools</h2>
  <p>Most online tools work by uploading your file to a server, processing it, then returning a download link. This model introduces several risks:</p>
  <ul>
    <li>Your file exists on someone else's computer (even briefly).</li>
    <li>Some services claim to delete files immediately, but the upload already happened.</li>
    <li>File names, sizes, and content are logged by the server.</li>
    <li>Some services inject watermarks or delay downloads to encourage upgrades.</li>
  </ul>
  <p>AHADEX tools avoid all of these by processing entirely on your device. You can verify this yourself: open your browser's developer tools, switch to the Network tab, and use any tool. You will see zero outbound file-upload requests.</p>

  <h2>Who is AHADEX Tools for?</h2>
  <p>Our tools are used by freelancers, job seekers, small business owners, designers, developers, and anyone who values privacy. Common use cases include:</p>
  <ul>
    <li>Preparing a CV for job applications (CV Builder)</li>
    <li>Designing a business card (Visiting Card Maker)</li>
    <li>Adding a WhatsApp or WiFi QR to a photo (Photo QR Code)</li>
    <li>Merging photos into a single PDF (Image to PDF)</li>
    <li>Resizing images for social media (Image Resizer)</li>
    <li>Converting WebP images for older software (WebP Converter)</li>
    <li>Extracting brand colors from a logo (Color Picker)</li>
  </ul>

  <h2>How to choose the right tool</h2>
  <p>If you're not sure which tool to use, here is a quick guide:</p>
  <ul>
    <li><strong>Applying for a job?</strong> Start with CV Builder to create a professional, ATS-friendly resume.</li>
    <li><strong>Starting a business?</strong> Use Visiting Card Maker to design print-ready business cards.</li>
    <li><strong>Sharing contact info?</strong> Use Photo QR Code to add a scannable QR to your photo.</li>
    <li><strong>Sending documents?</strong> Use Image to PDF to combine photos into a single PDF.</li>
    <li><strong>Uploading to social media?</strong> Use Image Resizer to fit specific dimensions.</li>
    <li><strong>Opening old images?</strong> Use WebP Converter to convert modern formats.</li>
    <li><strong>Matching brand colors?</strong> Use Color Picker to extract HEX, RGB, and HSL from any image.</li>
  </ul>

  <h2>Frequently asked questions</h2>
  <div>
    <h3>Are all tools really free?</h3>
    <p>Yes. Every tool is completely free to use without an account, watermark, or hidden limit. The site is supported by advertising shown outside the tool workspaces.</p>
  </div>
  <div>
    <h3>Do you upload my files?</h3>
    <p>No. Every tool processes files locally in your browser. You can verify this by opening your browser's developer tools and checking the Network tab while using any tool.</p>
  </div>
  <div>
    <h3>Do I need to create an account?</h3>
    <p>No. There is no signup, no email, and no login. Every tool works immediately.</p>
  </div>
  <div>
    <h3>Does it work on mobile phones and tablets?</h3>
    <p>Yes. Every tool is fully responsive and tested on iOS Safari, Android Chrome, Firefox for Android, and Samsung Internet.</p>
  </div>
  <div>
    <h3>Do you collect analytics?</h3>
    <p>We use Cloudflare Web Analytics, which is a privacy-first, cookieless service. We never see your files or the text you enter into a tool.</p>
  </div>
  <div>
    <h3>How can I report a bug or request a feature?</h3>
    <p>Email <a href="mailto:mdahadvi91@gmail.com">mdahadvi91@gmail.com</a> or open an issue on <a href="https://github.com/mdahadvi91/tools">GitHub</a>.</p>
  </div>

  <h2>Privacy across every tool</h2>
  <p>No tool on this site uploads your files to a server. Each tool reads its input locally, processes it in your browser, and hands the result back as a download. You can confirm this by opening your browser's developer tools and watching the Network tab while using any tool.</p>
</article>`;
}


const buildDynamicTerms = (html: string): string => {
  const toolNames = tools.map((t) => t.name).join(', ');
  let updated = html.replace(/CV Builder, Visiting Card Maker, Photo QR Code/g, toolNames);
  updated = updated.replace(/ছবি, PDF, টেক্সট, QR কোড ও অন্যান্য/g, tools.map((t) => t.nameBn || t.name).join(', '));
  return updated;
};

/* ---------- _ssr-content.ts ---------- */
function buildSsrContent(): Record<string, string> {
  const map: Record<string, string> = {};
  map["/"] = renderHomepage();
  map["/tools"] = renderToolsPage();
  for (const t of tools) map[t.path] = renderToolPage(t);
  const TOOL_LIST_EN = tools.map(t => t.name).join(", ");
  const TOOL_COUNT_STR = TOOL_COUNT.toString();

  for (const [path, html] of Object.entries(STATIC_SSR_CONTENT)) {
    let finalHtml = html;
    // Replace placeholders with actual dynamic data
    finalHtml = finalHtml.replace(/{{TOOL_COUNT}}/g, TOOL_COUNT_STR);
    finalHtml = finalHtml.replace(/{{TOOL_LIST}}/g, TOOL_LIST_EN);
    
    // Apply dynamic terms if needed (legacy fallback)
    if (path === "/terms") {
      finalHtml = buildDynamicTerms(finalHtml);
    }
    map[path] = finalHtml;
  }
  return map;
}

/* ---------- _data.ts ---------- */
interface Meta {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}

function buildData(): { toolMeta: Record<string, Meta>; staticMeta: Record<string, Meta> } {
  const toolMeta: Record<string, Meta> = {};
  for (const t of tools) {
    toolMeta[t.path] = {
      path: t.path,
      title: t.seo.title,
      description: t.seo.description,
      ogImage: ogImagePaths[t.id] || t.seo.ogImage,
    };
  }

  const staticMeta: Record<string, Meta> = {
    "/": {
      path: "/",
      title: `AHADEX Tools — ${TOOL_COUNT} Free, Private Browser-Based Tools`,
      description: `${TOOL_COUNT} free browser-based tools for CV, QR, PDF, image editing. No uploads—everything runs in your browser.`,
      ogImage: "/images/og/home-og.png",
    },
    "/tools": {
      path: "/tools",
      title: `All Tools — ${TOOL_COUNT} Free Browser Utilities | AHADEX Tools`,
      description: `Browse ${TOOL_COUNT} free browser-based tools: CV Builder, QR Code, PDF, Resizer, Color Picker, and WebP.`,
      ogImage: "/images/og/default-og.png",
    },
    "/about": {
      path: "/about",
      title: "About AHADEX Tools",
      description: "The story behind AHADEX Tools — free, private, browser-based utilities.",
    },
    "/contact": {
      path: "/contact",
      title: "Contact AHADEX Tools",
      description: "Get in touch with AHADEX Tools — bug reports, feature requests, press.",
    },
    "/privacy": {
      path: "/privacy",
      title: "Privacy Policy — AHADEX Tools",
      description: "How AHADEX Tools handles your data — spoiler: your files never leave your device.",
    },
    "/terms": {
      path: "/terms",
      title: "Terms of Service — AHADEX Tools",
      description: "Read the terms of service for using AHADEX Tools — free, private, browser-based utilities.",
    },
    "/disclaimer": {
      path: "/disclaimer",
      title: "Disclaimer — AHADEX Tools",
      description: "Important disclaimer information about using AHADEX Tools and its free browser-based utilities.",
    },
    "/editorial-policy": {
      path: "/editorial-policy",
      title: "Editorial Policy — AHADEX Tools",
      description: "Our editorial policy: accuracy, independence, transparency, and human-written content.",
    },
    "/accessibility": {
      path: "/accessibility",
      title: "Accessibility Statement — AHADEX Tools",
      description: "Our accessibility statement: WCAG 2.1 AA compliance, keyboard navigation, and screen reader support.",
    },
    "/cookie-policy": {
      path: "/cookie-policy",
      title: "Cookie Policy — AHADEX Tools",
      description: "Learn how AHADEX Tools uses cookies, local storage, and Cloudflare Web Analytics for privacy.",
    },
  };

  return { toolMeta, staticMeta };
}

/* ---------- _schema.ts ---------- */
function buildSchema(): Record<string, object> {
  const schema: Record<string, object> = {};

  // Homepage
  schema["/"] = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: `${SITE}/`,
        name: "AHADEX Tools",
        description: `Free browser-based tools for everyday digital tasks. ${TOOL_COUNT} tools: ${tools.map(t => t.name).join(", ")}. No server transmission.`,
        publisher: { "@id": `${SITE}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE}/#organization`,
        name: "AHADEX Tools",
        url: `${SITE}/`,
        logo: `${SITE}/images/og/default-og.png`,
        email: "mdahadvi91@gmail.com",
      },
    ],
  };

  // /tools
  schema["/tools"] = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE}/tools#page`,
        url: `${SITE}/tools`,
        name: `All Tools — ${TOOL_COUNT} free browser-based utilities`,
        description: `Browse ${TOOL_COUNT} free browser-based tools: CV Builder, QR Code, PDF, Resizer, Color Picker, and WebP.`,
        isPartOf: { "@id": `${SITE}/#website` },
      },
      {
        "@type": "ItemList",
        itemListElement: tools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: `${SITE}${t.path}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE}/tools` },
        ],
      },
    ],
  };

  // Tool pages
  for (const t of tools) {
    const graph: any[] = [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE}${t.path}#app`,
        name: t.name,
        description: t.seo.description,
        url: `${SITE}${t.path}`,
        applicationCategory: "WebApplication",
        operatingSystem: "Any (Browser)",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        image: `${SITE}${t.seo.ogImage}`,
        publisher: { "@type": "Organization", name: "AHADEX Tools", url: SITE },
        featureList: t.features.map((f) => f.title),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE}${t.path}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${SITE}/tools` },
          { "@type": "ListItem", position: 3, name: t.name, item: `${SITE}${t.path}` },
        ],
      },
    ];

    
    schema[t.path] = {
      "@context": "https://schema.org",
      "@graph": graph,
    };
  }

  // Static pages
  const staticTitles: Record<string, string> = {
    "/about": "About AHADEX Tools",
    "/contact": "Contact AHADEX Tools",
    "/privacy": "Privacy Policy",
    "/terms": "Terms of Service",
    "/disclaimer": "Disclaimer",
    "/cookie-policy": "Cookie Policy",
    "/accessibility": "Accessibility Statement",
    "/editorial-policy": "Editorial Policy",
  };
  for (const [path, title] of Object.entries(staticTitles)) {
    schema[path] = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${SITE}${path}#page`,
          url: `${SITE}${path}`,
          name: title,
          isPartOf: { "@id": `${SITE}/#website` },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: title, item: `${SITE}${path}` },
          ],
        },
      ],
    };
  }

  return schema;
}

/* ---------- sitemap.xml ---------- */
function buildSitemap(): string {
  const urlEntry = (
    loc: string,
    lastmod: string | undefined,
    changefreq: string,
    priority: string,
    image?: { loc: string; title: string; caption: string }
  ): string => {
    const lines = [
      `  <url>`,
      `    <loc>${SITE}${loc}</loc>`,
    ];
    if (lastmod) {
      lines.push(`    <lastmod>${lastmod}</lastmod>`);
    }
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    
    if (image) {
      lines.push(`    <image:image>`);
      lines.push(`      <image:loc>${SITE}${image.loc}</image:loc>`);
      lines.push(`      <image:title>${esc(image.title)}</image:title>`);
      lines.push(`      <image:caption>${esc(image.caption)}</image:caption>`);
      lines.push(`    </image:image>`);
    }
    lines.push(`  </url>`);
    return lines.join("\n");
  };

  const entries: string[] = [];
  
  // Dynamic tools from registry (use their actual lastModified)
  entries.push(urlEntry("/", STATIC_LASTMOD, "weekly", "1.0"));
  entries.push(urlEntry("/tools", STATIC_LASTMOD, "weekly", "0.9"));
  
  for (const t of tools) {
    entries.push(
      urlEntry(t.path, t.lastModified, "weekly", "0.9", {
        loc: t.seo.ogImage,
        title: t.seo.title,
        caption: t.seo.description,
      })
    );
  }

  // Static pages (use STATIC_LASTMOD)
  const staticPages = [
    { path: "/about", freq: "monthly", pri: "0.6" },
    { path: "/contact", freq: "monthly", pri: "0.6" },
    { path: "/privacy", freq: "yearly", pri: "0.3" },
    { path: "/terms", freq: "yearly", pri: "0.3" },
    { path: "/disclaimer", freq: "yearly", pri: "0.3" },
    { path: "/cookie-policy", freq: "yearly", pri: "0.3" },
    { path: "/editorial-policy", freq: "yearly", pri: "0.3" },
    { path: "/accessibility", freq: "yearly", pri: "0.3" },
  ];

  for (const page of staticPages) {
    entries.push(urlEntry(page.path, STATIC_LASTMOD, page.freq, page.pri));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>
`;
}

/* ---------- robots.txt ---------- */
function buildRobotsTxt(): string {
  return `User-agent: *
Allow: /

# --- AI Crawlers & Assistants ---
# Explicitly allowing major AI bots so our tools can be discovered and suggested.
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: cohere-ai
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
}

/* ---------- root files (README, index.html) ---------- */
function updateRootFiles() {
  // Update README.md
  const readmePath = resolve(ROOT, "README.md");
  if (existsSync(readmePath)) {
    let readme = readFileSync(readmePath, "utf-8");
    const toolList = tools.map((t, i) => `${i + 1}. **${t.name}** *(${t.category})* — ${t.description}`).join("\n");
    
    // Replace the entire tools section
    readme = readme.replace(
      /## 🚀 Currently Available Tools \(\d+\)[\s\S]*?---/,
      `## 🚀 Currently Available Tools (${TOOL_COUNT})\n\nEvery tool runs **entirely locally in your browser**. No files are uploaded, stored, or tracked on any server.\n\n${toolList}\n\n---`
    );
    writeFileSync(readmePath, readme);
    console.log("  ✓ README.md (auto-synced tool count & list)");
  }

  // Update index.html
  const htmlPath = resolve(ROOT, "index.html");
  if (existsSync(htmlPath)) {
    let html = readFileSync(htmlPath, "utf-8");
    const toolNames = tools.map(t => t.name).join(", ");
    
    // 1. Title
    html = html.replace(/AHADEX Tools — \d+ Free, Fast, Private Online Tools/g, `AHADEX Tools — ${TOOL_COUNT} Free, Fast, Private Online Tools`);
    
    // 2. Meta Description
    html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${TOOL_COUNT} free browser-based tools — ${toolNames}. processed locally in your browser." />`);
    
    // 3. OG Description
    html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${TOOL_COUNT} free browser-based tools — ${toolNames}. Files are processed locally." />`);
    
    // 4. Twitter Description
    html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${TOOL_COUNT} free browser-based tools — ${toolNames}. processed locally in your browser." />`);

    writeFileSync(htmlPath, html);
    console.log("  ✓ index.html (auto-synced title & meta)");
  }
}


/* ---------- OG Image Generator ---------- */
function generateOgImages() {
  const ogDir = resolve(ROOT, "public/images/og/tools");
  if (!existsSync(ogDir)) {
    mkdirSync(ogDir, { recursive: true });
  }

  for (const t of tools) {
    // Escape & for XML
    const safeName = t.name.replace(/&/g, "&amp;");
    const safeDesc = t.description.replace(/&/g, "&amp;");
    const icon = CATEGORY_ICON[t.category] || '🔧';

    const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0A1024" />
          <stop offset="100%" stop-color="#2D1B2E" />
        </linearGradient>
        <linearGradient id="text-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#D88B9A" />
          <stop offset="100%" stop-color="#C99667" />
        </linearGradient>
        <linearGradient id="icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D88B9A" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#C99667" stop-opacity="0.05" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)" />
      
      <!-- Decorative glowing circles -->
      <circle cx="100" cy="100" r="350" fill="#D88B9A" opacity="0.15" filter="blur(60px)" />
      <circle cx="1100" cy="550" r="300" fill="#C99667" opacity="0.15" filter="blur(60px)" />
      
      <!-- Top Left Branding -->
      <text x="80" y="100" font-family="system-ui, sans-serif" font-weight="bold" font-size="28" fill="#ffffff" opacity="0.5">AHADEX Tools</text>
      
      <!-- Main Content -->
      <text x="80" y="280" font-family="system-ui, sans-serif" font-weight="900" font-size="84" fill="url(#text-glow)">${safeName}</text>
      <text x="80" y="360" font-family="system-ui, sans-serif" font-weight="400" font-size="34" fill="#a0a0a0">${safeDesc}</text>
      
      <!-- Footer -->
      <text x="80" y="560" font-family="system-ui, sans-serif" font-weight="bold" font-size="32" fill="#ffffff" opacity="0.8">ahadex.online</text>
      
      <!-- Right Side Icon Box -->
      <rect x="880" y="180" width="240" height="240" rx="60" fill="url(#icon-bg)" stroke="#D88B9A" stroke-opacity="0.3" stroke-width="2" />
      <text x="1000" y="350" font-family="system-ui, sans-serif" font-size="120" text-anchor="middle">${icon}</text>
    </svg>`;

    const filename = t.seo.ogImage.split('/').pop()?.replace('.png', '.svg').replace('.jpg', '.svg') || `${t.slug}-og.svg`;
    writeFileSync(resolve(ogDir, filename), svg);
    
    // Point registry to the PNG version (which will be generated right after)
    ogImagePaths[t.id] = `/images/og/tools/${filename.replace('.svg', '.jpg')}`;
  }
  console.log(`  ✓ public/images/og/tools/*.svg (generated ${tools.length} beautiful unique OG images)`);
}


/* ---------- write files ---------- */
function writeAll() {
  console.log("▶ Generating SSR artifacts from src/data/tools.ts …");
  generateOgImages();
  console.log(`  Tools: ${TOOL_COUNT} (${tools.map((t) => t.id).join(", ")})`);

  // 1. _ssr-content.ts
  const ssrContent = buildSsrContent();
  const ssrHeader = `/* ============================================================
 * AUTO-GENERATED — do not edit by hand
 * Generated by scripts/generate-ssr.ts on ${GEN_DATE}
 * Source of truth: src/data/tools.ts
 * ============================================================ */`;
  const ssrBody = JSON.stringify(ssrContent, null, 2);
  writeFileSync(
    resolve(ROOT, "functions/_ssr-content.ts"),
    `${ssrHeader}\n\nexport const SSR_CONTENT: Record<string, string> = ${ssrBody};\n`
  );
  console.log("  ✓ functions/_ssr-content.ts");

  // 2. _data.ts
  const { toolMeta, staticMeta } = buildData();
  const dataHeader = `/* ============================================================
 * AUTO-GENERATED — do not edit by hand
 * Generated by scripts/generate-ssr.ts on ${GEN_DATE}
 * Source of truth: src/data/tools.ts
 * ============================================================ */

export interface ToolMeta {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
}`;
  writeFileSync(
    resolve(ROOT, "functions/_data.ts"),
    `${dataHeader}

export const TOOL_META: Record<string, ToolMeta> = ${JSON.stringify(toolMeta, null, 2)};

export const STATIC_META: Record<string, ToolMeta> = ${JSON.stringify(staticMeta, null, 2)};

// Empty guide exports — kept for backward compatibility with build scripts
export const GUIDE_META: Record<string, ToolMeta> = {};
`
  );
  console.log("  ✓ functions/_data.ts");

  // 3. _schema.ts
  const schema = buildSchema();
  const schemaHeader = `/* ============================================================
 * AUTO-GENERATED — do not edit by hand
 * Generated by scripts/generate-ssr.ts on ${GEN_DATE}
 * Source of truth: src/data/tools.ts
 * ============================================================ */`;
  writeFileSync(
    resolve(ROOT, "functions/_schema.ts"),
    `${schemaHeader}\n\nexport const SSR_SCHEMA: Record<string, object> = ${JSON.stringify(schema, null, 2)};\n`
  );
  console.log("  ✓ functions/_schema.ts");

  // 4. sitemap.xml
  writeFileSync(resolve(ROOT, "public/sitemap.xml"), buildSitemap());
  console.log("  ✓ public/sitemap.xml");

  // 5. robots.txt
  writeFileSync(resolve(ROOT, "public/robots.txt"), buildRobotsTxt());
  console.log("  ✓ public/robots.txt");

  // Update root files
  updateRootFiles();

  console.log("✅ Done.\n");
}

writeAll();
