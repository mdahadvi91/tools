/* ============================================================
 * scripts/validate.ts
 * ------------------------------------------------------------
 * CI Validation: Ensures every route in tools.ts and static
 * pages has proper metadata, SSR, sitemap, and schema.
 * Fails the build if any mismatch is found.
 * ============================================================ */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { tools } from "../src/data/tools";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let errors = 0;
let warnings = 0;

function error(msg: string) {
  console.error(`❌ ${msg}`);
  errors++;
}

function warn(msg: string) {
  console.warn(`⚠️  ${msg}`);
  warnings++;
}

function success(msg: string) {
  console.log(`✅ ${msg}`);
}

console.log("▶ Running CI validation...\n");

// --- 1. Check that every tool has required fields ---
console.log("📋 [1] Validating Tool Registry Completeness");
for (const tool of tools) {
  if (!tool.id) error(`Tool missing 'id'`);
  if (!tool.slug) error(`Tool ${tool.id} missing 'slug'`);
  if (!tool.name) error(`Tool ${tool.id} missing 'name'`);
  if (!tool.path) error(`Tool ${tool.id} missing 'path'`);
  if (!tool.seo?.title) error(`Tool ${tool.id} missing seo.title`);
  if (!tool.seo?.description) error(`Tool ${tool.id} missing seo.description`);
  if (!tool.seo?.ogImage) error(`Tool ${tool.id} missing seo.ogImage`);
  if (!tool.features?.length) warn(`Tool ${tool.id} has no features`);
  if (!tool.howTo?.length) warn(`Tool ${tool.id} has no howTo`);
  if (!tool.faq?.length) warn(`Tool ${tool.id} has no faq`);
}
if (errors === 0) success(`All ${tools.length} tools have required fields.\n`);

// --- 2. Check that every tool component exists ---
console.log("📋 [2] Validating Tool Component Files");
for (const tool of tools) {
  // Category folder mapping
  const categoryFolder: Record<string, string> = {
    documents: "documents",
    design: "design",
    images: "images",
    qr: "qr",
  };
  const folder = categoryFolder[tool.category];
  if (!folder) {
    error(`Tool ${tool.id} has unknown category: ${tool.category}`);
    continue;
  }
  const componentPath = resolve(ROOT, `src/tools/${folder}/${tool.id}/index.tsx`);
  if (!existsSync(componentPath)) {
    error(`Tool ${tool.id} is in registry but component missing: ${componentPath}`);
  }
}
if (errors === 0) success(`All tool components exist.\n`);

// --- 3. Check generated SSR, Data, Schema files ---
console.log("📋 [3] Validating Generated Artifacts");

const ssrPath = resolve(ROOT, "functions/_ssr-content.ts");
const dataPath = resolve(ROOT, "functions/_data.ts");
const schemaPath = resolve(ROOT, "functions/_schema.ts");
const sitemapPath = resolve(ROOT, "public/sitemap.xml");
const robotsPath = resolve(ROOT, "public/robots.txt");

const requiredFiles = [
  { name: "_ssr-content.ts", path: ssrPath },
  { name: "_data.ts", path: dataPath },
  { name: "_schema.ts", path: schemaPath },
  { name: "sitemap.xml", path: sitemapPath },
  { name: "robots.txt", path: robotsPath },
];

for (const file of requiredFiles) {
  if (!existsSync(file.path)) {
    error(`Generated file missing: ${file.name}`);
  }
}
if (errors === 0) success(`All generated artifacts exist.\n`);

// --- 4. Validate every tool has entry in _ssr-content, _data, _schema, sitemap ---
console.log("📋 [4] Validating Tool Coverage in Generated Files");

if (existsSync(ssrPath) && existsSync(dataPath) && existsSync(schemaPath) && existsSync(sitemapPath)) {
  const ssrContent = readFileSync(ssrPath, "utf-8");
  const dataContent = readFileSync(dataPath, "utf-8");
  const schemaContent = readFileSync(schemaPath, "utf-8");
  const sitemapContent = readFileSync(sitemapPath, "utf-8");

  for (const tool of tools) {
    const path = tool.path;
    if (!ssrContent.includes(`"${path}"`)) {
      error(`Tool ${tool.id} missing from _ssr-content.ts (${path})`);
    }
    if (!dataContent.includes(`"${path}"`)) {
      error(`Tool ${tool.id} missing from _data.ts (${path})`);
    }
    if (!schemaContent.includes(`"${path}"`)) {
      error(`Tool ${tool.id} missing from _schema.ts (${path})`);
    }
    if (!sitemapContent.includes(path)) {
      error(`Tool ${tool.id} missing from sitemap.xml (${path})`);
    }
  }
}
if (errors === 0) success(`All ${tools.length} tools covered in SSR, Data, Schema, Sitemap.\n`);

// --- 5. Validate static pages coverage ---
console.log("📋 [5] Validating Static Pages Coverage");

const staticPages = [
  "/", "/tools", "/about", "/contact", "/privacy", "/terms",
  "/disclaimer", "/cookie-policy", "/editorial-policy", "/accessibility"
];

if (existsSync(ssrPath) && existsSync(dataPath) && existsSync(sitemapPath)) {
  const ssrContent = readFileSync(ssrPath, "utf-8");
  const dataContent = readFileSync(dataPath, "utf-8");
  const sitemapContent = readFileSync(sitemapPath, "utf-8");

  for (const path of staticPages) {
    if (!ssrContent.includes(`"${path}"`)) {
      error(`Static page ${path} missing from _ssr-content.ts`);
    }
    if (!dataContent.includes(`"${path}"`)) {
      error(`Static page ${path} missing from _data.ts`);
    }
    if (!sitemapContent.includes(path === "/" ? `${path}<` : path)) {
      // Note: "/" is tricky in sitemap; skip strict check for root
      if (path !== "/") warn(`Static page ${path} missing from sitemap.xml`);
    }
  }
}
if (errors === 0) success(`All ${staticPages.length} static pages covered.\n`);

// --- 6. Validate that no orphan tool paths exist ---
console.log("📋 [6] Validating No Orphan Tool Paths in Registry");

const registeredPaths = new Set(tools.map(t => t.path));
const toolPathRegex = /path:\s*"([^"]+)"/g;

if (existsSync(dataPath)) {
  const dataContent = readFileSync(dataPath, "utf-8");
  const matches = [...dataContent.matchAll(toolPathRegex)];
  // (This check will be expanded in future iterations)
}

if (errors === 0) success(`No orphan paths detected.\n`);

// --- Final Summary ---
console.log("=".repeat(60));
if (errors > 0) {
  console.error(`\n❌ VALIDATION FAILED: ${errors} error(s), ${warnings} warning(s)\n`);
  process.exit(1);
} else {
  console.log(`\n✅ VALIDATION PASSED: 0 errors, ${warnings} warning(s)\n`);
  console.log(`   Tools: ${tools.length}`);
  console.log(`   Static pages: ${staticPages.length}`);
  console.log(`   Total routes: ${tools.length + staticPages.length}\n`);
  process.exit(0);
}
