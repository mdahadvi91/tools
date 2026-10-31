import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tools } from "../src/data/tools";
import { STATIC_SSR_CONTENT } from "./static-content";

const ROOT = process.cwd();
let errors = 0;
let warnings = 0;

function error(msg: string) {
  console.error(`❌ ${msg}`);
  errors++;
}

function warning(msg: string) {
  console.warn(`⚠️  ${msg}`);
  warnings++;
}

function success(msg: string) {
  console.log(`✅ ${msg}`);
}

// Paths
const ssrPath = resolve(ROOT, "functions/_ssr-content.ts");
const dataPath = resolve(ROOT, "functions/_data.ts");
const schemaPath = resolve(ROOT, "functions/_schema.ts");
const sitemapPath = resolve(ROOT, "public/sitemap.xml");
const robotsPath = resolve(ROOT, "public/robots.txt");

// 1. Tool Registry Completeness
console.log("📋 [1] Validating Tool Registry Completeness");
const before_1 = errors;
const requiredFields = ["id", "name", "description", "category", "path", "seo"];
for (const tool of tools) {
  for (const field of requiredFields) {
    if (!(tool as any)[field]) {
      error(`Tool "${tool.id || "unknown"}" missing field "${field}"`);
    }
  }
}
if (errors === before_1) success(`All ${tools.length} tools have required fields.\n`);

// 2. Tool Component Files
console.log("📋 [2] Validating Tool Component Files");
const before_2 = errors;
const toolDirs = [
  "src/tools/design/color-picker",
  "src/tools/images/webp-converter",
  "src/tools/images/image-resizer",
  "src/tools/documents/image-to-pdf",
  "src/tools/qr/photo-qr",
  "src/tools/design/visiting-card",
  "src/tools/documents/cv-builder",
];
for (const dir of toolDirs) {
  if (!existsSync(resolve(ROOT, dir, "index.tsx"))) {
    error(`Missing index.tsx in ${dir}`);
  }
}
if (errors === before_2) success("All tool components exist.\n");

// 3. Generated Artifacts
console.log("📋 [3] Validating Generated Artifacts");
const before_3 = errors;
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
if (errors === before_3) success("All generated artifacts exist.\n");

// Load generated content
let ssrContent = "";
let dataContent = "";
let schemaContent = "";
let sitemapContent = "";

if (existsSync(ssrPath)) ssrContent = readFileSync(ssrPath, "utf-8");
if (existsSync(dataPath)) dataContent = readFileSync(dataPath, "utf-8");
if (existsSync(schemaPath)) schemaContent = readFileSync(schemaPath, "utf-8");
if (existsSync(sitemapPath)) sitemapContent = readFileSync(sitemapPath, "utf-8");

// 4. Tool Coverage
console.log("📋 [4] Validating Tool Coverage in Generated Files");
const before_4 = errors;
for (const tool of tools) {
  if (!ssrContent.includes(`"${tool.path}"`)) error(`Missing ${tool.path} in SSR`);
  if (!dataContent.includes(`"${tool.path}"`)) error(`Missing ${tool.path} in Data`);
  if (!sitemapContent.includes(`${tool.path}`)) error(`Missing ${tool.path} in Sitemap`);
}
if (errors === before_4) success(`All ${tools.length} tools covered in SSR, Data, Schema, Sitemap.\n`);

// 5. Static Pages Coverage
console.log("📋 [5] Validating Static Pages Coverage");
const before_5 = errors;
const staticPages = [...Object.keys(STATIC_SSR_CONTENT), "/", "/tools"];
for (const page of staticPages) {
  if (!dataContent.includes(`"${page}"`)) {
    error(`Missing static page ${page} in _data.ts`);
  }
}
if (errors === before_5) success(`All ${staticPages.length} static pages covered.\n`);

// 6. No Orphan Paths
console.log("📋 [6] Validating No Orphan Paths");
const before_6 = errors;
const allKnownPaths = new Set([...tools.map(t => t.path), ...staticPages]);
const dataPathRegex = /path:\s*"([^"]+)"/g;
let match;
let orphanFound = false;
while ((match = dataPathRegex.exec(dataContent)) !== null) {
  const p = match[1];
  if (!allKnownPaths.has(p)) {
    warning(`Extra path (in _data.ts but not in registry): ${p}`);
    orphanFound = true;
  }
}
if (!orphanFound && errors === before_6) success(`No orphan paths. All ${allKnownPaths.size} expected paths are in _data.ts.\n`);
else if (errors === before_6) console.log(); 

// 7. No Duplicate Routes
console.log("📋 [7] Validating No Duplicate Routes");
const before_7 = errors;
const routeCounts = new Map<string, number>();
const allPaths = [...tools.map(t => t.path), ...staticPages];
for (const p of allPaths) {
  routeCounts.set(p, (routeCounts.get(p) || 0) + 1);
}
let dupFound = false;
for (const [p, count] of routeCounts.entries()) {
  if (count > 1) {
    error(`Duplicate route: ${p} (${count} times)`);
    dupFound = true;
  }
}
if (!dupFound) success(`No duplicate routes. ${routeCounts.size} unique routes defined.\n`);

// 7.1 Validating No Duplicate Tool IDs/Slugs
console.log("📋 [7.1] Validating No Duplicate Tool IDs/Slugs");
const before_7_1 = errors;
const ids = new Set<string>();
const slugs = new Set<string>();
let dupIdSlugFound = false;

for (const tool of tools) {
  if (ids.has(tool.id)) {
    error(`Duplicate tool ID: "${tool.id}"`);
    dupIdSlugFound = true;
  }
  ids.add(tool.id);

  if (slugs.has(tool.slug)) {
    error(`Duplicate tool slug: "${tool.slug}"`);
    dupIdSlugFound = true;
  }
  slugs.add(tool.slug);
}
if (!dupIdSlugFound) success(`All tool IDs and slugs are unique.\n`);

// 8. Registry Metadata Equality
console.log("📋 [8] Validating Registry ↔ Generated Metadata Equality");
const before_8 = errors;
let metadataErrors = 0;
for (const tool of tools) {
  const titleStr = JSON.stringify(tool.seo.title);
  const descStr = JSON.stringify(tool.seo.description);
  const pathStr = JSON.stringify(tool.path);

  if (!dataContent.includes(titleStr)) {
    error(`Metadata mismatch for ${tool.id}: title "${tool.seo.title}" not found in _data.ts`);
    metadataErrors++;
  }
  if (!dataContent.includes(descStr)) {
    error(`Metadata mismatch for ${tool.id}: description "${tool.seo.description}" not found in _data.ts`);
    metadataErrors++;
  }
  if (!dataContent.includes(pathStr)) {
    error(`Metadata mismatch for ${tool.id}: path "${tool.path}" not found in _data.ts`);
    metadataErrors++;
  }
}
if (metadataErrors === 0) {
  success(`Registry metadata matches generated _data.ts for all ${tools.length} tools.\n`);
}

// 9. Title/Description Uniqueness
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

// 10. Validating Related Tools References
console.log("📋 [10] Validating Related Tools References");
const before_10 = errors;
const allToolIds = new Set(tools.map(t => t.id));
for (const tool of tools) {
  if (tool.relatedTools) {
    for (const relId of tool.relatedTools) {
      if (!allToolIds.has(relId)) {
        error(`Broken relatedTools reference in "${tool.id}": missing ID "${relId}"`);
      }
    }
  }
}
if (errors === before_10) {
  success("No broken relatedTools references found.\n");
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
