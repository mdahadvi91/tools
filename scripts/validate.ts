/* ============================================================
 * scripts/validate.ts
 * ------------------------------------------------------------
 * CI Validation: Ensures every route in tools.ts and static
 * pages has proper metadata, SSR, sitemap, and schema.
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
  const before_1 = errors;
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
if (errors === before_1) success(`All ${tools.length} tools have required fields.\n`);

// --- 1. Check that every tool component exists ---
console.log("📋 [2] Validating Tool Component Files");
  const before_2 = errors;
for (const tool of tools) {
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
if (errors === before_2) success(`All tool components exist.\n`);

// --- 2. Check generated files exist ---
console.log("📋 [3] Validating Generated Artifacts");
  const before_3 = errors;
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
if (errors === before_3) success(`All generated artifacts exist.\n`);

// --- 3. Load generated content into memory ---
let ssrContent = "";
let dataContent = "";
let schemaContent = "";
let sitemapContent = "";

if (existsSync(ssrPath)) ssrContent = readFileSync(ssrPath, "utf-8");
if (existsSync(dataPath)) dataContent = readFileSync(dataPath, "utf-8");
if (existsSync(schemaPath)) schemaContent = readFileSync(schemaPath, "utf-8");
if (existsSync(sitemapPath)) sitemapContent = readFileSync(sitemapPath, "utf-8");

// --- 3. Tool coverage in generated files ---
console.log("📋 [4] Validating Tool Coverage in Generated Files");
  const before_4 = errors;
for (const tool of tools) {
  if (!ssrContent.includes(`"${tool.path}"`)) {
    error(`Tool ${tool.id} missing from _ssr-content.ts (${tool.path})`);
  }
  if (!dataContent.includes(`"${tool.path}"`)) {
    error(`Tool ${tool.id} missing from _data.ts (${tool.path})`);
  }
  if (!schemaContent.includes(`"${tool.path}"`)) {
    error(`Tool ${tool.id} missing from _schema.ts (${tool.path})`);
  }
  if (!sitemapContent.includes(tool.path)) {
    error(`Tool ${tool.id} missing from sitemap.xml (${tool.path})`);
  }
}
if (errors === before_4) success(`All ${tools.length} tools covered in SSR, Data, Schema, Sitemap.\n`);

// --- 4. Static pages coverage ---
console.log("📋 [5] Validating Static Pages Coverage");
  const before_5 = errors;
const staticPages = [
  "/", "/tools", "/about", "/contact", "/privacy", "/terms",
  "/disclaimer", "/cookie-policy", "/editorial-policy", "/accessibility"
];
for (const path of staticPages) {
  if (!ssrContent.includes(`"${path}"`)) {
    error(`Static page ${path} missing from _ssr-content.ts`);
  }
  if (!dataContent.includes(`"${path}"`)) {
    error(`Static page ${path} missing from _data.ts`);
  }
}
if (errors === before_5) success(`All ${staticPages.length} static pages covered.\n`);

// --- 5. True Orphan Path Detection ---
console.log("📋 [6] Validating No Orphan Paths");
  const before_6 = errors;
const dataPathRegex = /"(\/(?:[^"]*))":\s*\{/g;
const dataPaths = new Set<string>();
let match;
while ((match = dataPathRegex.exec(dataContent)) !== null) {
  dataPaths.add(match[1]);
}

const expectedPaths = new Set<string>([
  ...tools.map(t => t.path),
  ...staticPages,
]);

const orphansInData = [...expectedPaths].filter(p => !dataPaths.has(p));
if (orphansInData.length > 0) {
  for (const p of orphansInData) {
    error(`Orphan path (in registry but missing from _data.ts): ${p}`);
  }
}

const extrasInData = [...dataPaths].filter(p => !expectedPaths.has(p));
if (extrasInData.length > 0) {
  for (const p of extrasInData) {
    warn(`Extra path (in _data.ts but not in registry): ${p}`);
  }
}

if (orphansInData.length === 0 && extrasInData.length === 0) {
  success(`No orphan paths. All ${expectedPaths.size} expected paths are in _data.ts.\n`);
}

// --- 6. Duplicate Route Detection ---
console.log("📋 [7] Validating No Duplicate Routes");
  const before_7 = errors;
const routeCounts = new Map<string, number>();
for (const tool of tools) {
  routeCounts.set(tool.path, (routeCounts.get(tool.path) || 0) + 1);
}
for (const page of staticPages) {
  routeCounts.set(page, (routeCounts.get(page) || 0) + 1);
}
let duplicateFound = false;
for (const [path, count] of routeCounts.entries()) {
  if (count > 1) {
    error(`Duplicate route detected: ${path} appears ${count} times`);
    duplicateFound = true;
  }
}
if (!duplicateFound) {
  success(`No duplicate routes. ${routeCounts.size} unique routes defined.\n`);
}

// --- 7. Registry ↔ Generated Metadata Equality ---
console.log("📋 [8] Validating Registry ↔ Generated Metadata Equality");
  const before_8 = errors;
let metadataErrors = 0;
for (const tool of tools) {
  const escapedPath = tool.path;
  const escapedTitle = tool.seo.title.replace(/"/g, '\\"');
  const escapedDesc = tool.seo.description.replace(/"/g, '\\"');
  
  if (!dataContent.includes(`"title": "${escapedTitle}"`) && !dataContent.includes(`"title": "${escapedTitle}"`.replace(/\\"/g, '"'))) {
    error(`Metadata mismatch for ${tool.id}: title "${tool.seo.title}" not found in _data.ts`);
    metadataErrors++;
  }
  if (!dataContent.includes(escapedDesc) && !dataContent.includes(tool.seo.description)) {
    error(`Metadata mismatch for ${tool.id}: description not found in _data.ts`);
    metadataErrors++;
  }
  if (tool.seo.ogImage && !dataContent.includes(tool.seo.ogImage)) {
    error(`Metadata mismatch for ${tool.id}: ogImage "${tool.seo.ogImage}" not found in _data.ts`);
    metadataErrors++;
  }
}
if (metadataErrors === 0) {
  success(`Registry metadata matches generated _data.ts for all ${tools.length} tools.\n`);
}

// --- 8. Title/Description Uniqueness Across All Routes ---
console.log("📋 [9] Validating Title/Description Uniqueness");
  const before_9 = errors;
const titles = new Set<string>();
const descriptions = new Set<string>();
let duplicatesFound = false;

for (const tool of tools) {
  if (titles.has(tool.seo.title)) {
    error(`Duplicate title across tools: "${tool.seo.title}"`);
    duplicatesFound = true;
  }
  titles.add(tool.seo.title);
  
  if (descriptions.has(tool.seo.description)) {
    error(`Duplicate description across tools: "${tool.seo.description.substring(0, 50)}..."`);
    duplicatesFound = true;
  }
  descriptions.add(tool.seo.description);
}
if (!duplicatesFound) {
  success(`All tool titles (${titles.size}) and descriptions (${descriptions.size}) are unique.\n`);
}

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
