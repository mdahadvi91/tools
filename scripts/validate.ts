import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tools } from "../src/data/tools";
import { STATIC_SSR_CONTENT } from "./static-content";

const ROOT = process.cwd();
let errors = 0;
let warnings = 0;

function error(msg: string) { console.error(`❌ ${msg}`); errors++; }
function warning(msg: string) { console.warn(`⚠️  ${msg}`); warnings++; }
function success(msg: string) { console.log(`✅ ${msg}`); }

const ssrPath = resolve(ROOT, "functions/_ssr-content.ts");
const dataPath = resolve(ROOT, "functions/_data.ts");
const schemaPath = resolve(ROOT, "functions/_schema.ts");
const sitemapPath = resolve(ROOT, "public/sitemap.xml");
const robotsPath = resolve(ROOT, "public/robots.txt");

// 1
console.log("📋 [1] Validating Tool Registry Completeness");
const before_1 = errors;
const requiredFields = ["id", "name", "description", "category", "path", "seo"];
for (const tool of tools) {
  for (const field of requiredFields) {
    if (!(tool as any)[field]) error(`Tool "${tool.id || "unknown"}" missing field "${field}"`);
  }
}
if (errors === before_1) success(`All ${tools.length} tools have required fields.\n`);

// 2
console.log("📋 [2] Validating Tool Component Files");
const before_2 = errors;
const toolDirs = [
  "src/tools/design/color-picker", "src/tools/images/webp-converter",
  "src/tools/images/image-resizer", "src/tools/documents/image-to-pdf",
  "src/tools/qr/photo-qr", "src/tools/design/visiting-card",
  "src/tools/documents/cv-builder"
];
for (const dir of toolDirs) {
  if (!existsSync(resolve(ROOT, dir, "index.tsx"))) error(`Missing index.tsx in ${dir}`);
}
if (errors === before_2) success("All tool components exist.\n");

// 3
console.log("📋 [3] Validating Generated Artifacts");
const before_3 = errors;
const requiredFiles = [
  { name: "_ssr-content.ts", path: ssrPath }, { name: "_data.ts", path: dataPath },
  { name: "_schema.ts", path: schemaPath }, { name: "sitemap.xml", path: sitemapPath },
  { name: "robots.txt", path: robotsPath }
];
for (const file of requiredFiles) {
  if (!existsSync(file.path)) error(`Generated file missing: ${file.name}`);
}
if (errors === before_3) success("All generated artifacts exist.\n");

let ssrContent = "", dataContent = "", schemaContent = "", sitemapContent = "";
if (existsSync(ssrPath)) ssrContent = readFileSync(ssrPath, "utf-8");
if (existsSync(dataPath)) dataContent = readFileSync(dataPath, "utf-8");
if (existsSync(schemaPath)) schemaContent = readFileSync(schemaPath, "utf-8");
if (existsSync(sitemapPath)) sitemapContent = readFileSync(sitemapPath, "utf-8");

// 4
console.log("📋 [4] Validating Tool Coverage in Generated Files");
const before_4 = errors;
for (const tool of tools) {
  if (!ssrContent.includes(`"${tool.path}"`)) error(`Missing ${tool.path} in SSR`);
  if (!dataContent.includes(`"${tool.path}"`)) error(`Missing ${tool.path} in Data`);
  if (!sitemapContent.includes(`${tool.path}`)) error(`Missing ${tool.path} in Sitemap`);
}
if (errors === before_4) success(`All ${tools.length} tools covered in SSR, Data, Schema, Sitemap.\n`);

// 5
console.log("📋 [5] Validating Static Pages Coverage");
const before_5 = errors;
const staticPages = [...Object.keys(STATIC_SSR_CONTENT), "/", "/tools"];
for (const page of staticPages) {
  if (!dataContent.includes(`"${page}"`)) error(`Missing static page ${page} in _data.ts`);
}
if (errors === before_5) success(`All ${staticPages.length} static pages covered.\n`);

// 6
console.log("📋 [6] Validating No Orphan Paths");
const before_6 = errors;
const allKnownPaths = new Set([...tools.map(t => t.path), ...staticPages]);
let orphanFound = false;

// A. _data.ts
const dataPathRegex = /path:\s*"([^"]+)"/g;
let match;
while ((match = dataPathRegex.exec(dataContent)) !== null) {
  if (!allKnownPaths.has(match[1])) { warning(`Extra path in _data.ts: ${match[1]}`); orphanFound = true; }
}

// B. sitemap.xml
const sitemapRegex = /<loc>([^<]*)<\/loc>/g;
while ((match = sitemapRegex.exec(sitemapContent)) !== null) {
  try {
    let p = new URL(match[1], "https://ahadex.online").pathname;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    if (!allKnownPaths.has(p) && p !== "/") { warning(`Extra path in sitemap.xml: ${p}`); orphanFound = true; }
  } catch (e) {}
}

// C. _schema.ts
const schemaRegex = /"url":\s*"([^"]*)"/g;
while ((match = schemaRegex.exec(schemaContent)) !== null) {
  try {
    let p = new URL(match[1], "https://ahadex.online").pathname;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    if (!allKnownPaths.has(p) && p !== "/") { warning(`Extra path in _schema.ts: ${p}`); orphanFound = true; }
  } catch (e) {}
}

if (errors === before_6) {
  if (!orphanFound) success(`No orphan paths found across _data.ts, sitemap.xml, and _schema.ts.\n`);
  else console.log();
}

// 7
console.log("📋 [7] Validating No Duplicate Routes");
const before_7 = errors;
const routeCounts = new Map<string, number>();
for (const p of [...tools.map(t => t.path), ...staticPages]) {
  routeCounts.set(p, (routeCounts.get(p) || 0) + 1);
}
let dupFound = false;
for (const [p, count] of routeCounts.entries()) {
  if (count > 1) { error(`Duplicate route: ${p} (${count} times)`); dupFound = true; }
}
if (errors === before_7) success(`No duplicate routes. ${routeCounts.size} unique routes defined.\n`);

// 7.1
console.log("📋 [7.1] Validating No Duplicate Tool IDs/Slugs");
const before_7_1 = errors;
const ids = new Set<string>(), slugs = new Set<string>();
let dupIdSlugFound = false;
for (const tool of tools) {
  if (ids.has(tool.id)) { error(`Duplicate ID: "${tool.id}"`); dupIdSlugFound = true; }
  ids.add(tool.id);
  if (slugs.has(tool.slug)) { error(`Duplicate slug: "${tool.slug}"`); dupIdSlugFound = true; }
  slugs.add(tool.slug);
}
if (errors === before_7_1) success(`All tool IDs and slugs are unique.\n`);

// 8
console.log("📋 [8] Validating Registry ↔ Generated Metadata Equality");
const before_8 = errors;
for (const tool of tools) {
  if (!dataContent.includes(JSON.stringify(tool.seo.title))) error(`Title mismatch: ${tool.id}`);
  if (!dataContent.includes(JSON.stringify(tool.seo.description))) error(`Desc mismatch: ${tool.id}`);
  if (!dataContent.includes(JSON.stringify(tool.path))) error(`Path mismatch: ${tool.id}`);
}
if (errors === before_8) success(`Registry metadata matches generated _data.ts for all ${tools.length} tools.\n`);

// 9
console.log("📋 [9] Validating Title/Description Uniqueness");
const before_9 = errors;
const titles = new Set<string>(), descriptions = new Set<string>();
let duplicatesFound = false;
for (const tool of tools) {
  if (titles.has(tool.seo.title)) { error(`Duplicate title: "${tool.seo.title}"`); duplicatesFound = true; }
  titles.add(tool.seo.title);
  if (descriptions.has(tool.seo.description)) { error(`Duplicate desc: "${tool.seo.description.substring(0, 50)}..."`); duplicatesFound = true; }
  descriptions.add(tool.seo.description);
}
if (errors === before_9) success(`All tool titles and descriptions are unique.\n`);

// 10
console.log("📋 [10] Validating Related Tools References");
const before_10 = errors;
const allToolIds = new Set(tools.map(t => t.id));
for (const tool of tools) {
  if (tool.relatedTools) {
    for (const relId of tool.relatedTools) {
      if (!allToolIds.has(relId)) error(`Broken relatedTools in "${tool.id}": missing "${relId}"`);
    }
  }
}
if (errors === before_10) success("No broken relatedTools references found.\n");

// Final Summary
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
