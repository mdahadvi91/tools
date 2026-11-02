/* ============================================================
 * verify-headers.ts — CI drift guard
 * ------------------------------------------------------------
 * Fails if public/_headers or the generated TS file diverges
 * from scripts/security-headers.ts.
 *
 * Run: npm run verify:headers
 * ============================================================ */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BASE_SECURITY_HEADERS,
  renderHeadersFile,
} from "./security-headers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let failed = false;

// 1. public/_headers must equal renderHeadersFile()
const headersPath = resolve(ROOT, "public/_headers");
const actualHeaders = readFileSync(headersPath, "utf8");
const expectedHeaders = renderHeadersFile();
if (actualHeaders !== expectedHeaders) {
  console.error("❌ public/_headers is out of sync with scripts/security-headers.ts");
  console.error("   Run: npm run generate:headers");
  failed = true;
} else {
  console.log("  ✓ public/_headers");
}

// 2. functions/_security-headers.generated.ts must equal expected
const genPath = resolve(ROOT, "functions/_security-headers.generated.ts");
const actualGen = readFileSync(genPath, "utf8");
const expectedGen = `/* ============================================================
 * AUTO-GENERATED — do not edit.
 * Source: scripts/security-headers.ts
 * Regenerate: npm run generate:headers
 * ============================================================ */

export const SECURITY_HEADERS: Record<string, string> = ${JSON.stringify(BASE_SECURITY_HEADERS, null, 2)} as const;
`;
if (actualGen !== expectedGen) {
  console.error("❌ functions/_security-headers.generated.ts is out of sync");
  console.error("   Run: npm run generate:headers");
  failed = true;
} else {
  console.log("  ✓ functions/_security-headers.generated.ts");
}

// 3. Middleware must not contain inline SECURITY_HEADERS const or buildCsp
const mwPath = resolve(ROOT, "functions/_middleware.ts");
const mw = readFileSync(mwPath, "utf8");
if (/const SECURITY_HEADERS: Record<string, string> = \{/.test(mw)) {
  console.error("❌ functions/_middleware.ts still defines SECURITY_HEADERS inline");
  failed = true;
}
if (/function buildCsp\(/.test(mw)) {
  console.error("❌ functions/_middleware.ts still defines buildCsp() locally");
  failed = true;
}
if (!failed) console.log("  ✓ functions/_middleware.ts uses generated imports");

// 4. Forbidden patterns (defense in depth)
if (actualHeaders.includes("'unsafe-eval'")) {
  console.error("❌ public/_headers contains 'unsafe-eval'");
  failed = true;
}
if (actualHeaders.includes("img-src 'self' data: blob: https:;")) {
  console.error("❌ public/_headers contains over-permissive img-src https:");
  failed = true;
}

if (failed) {
  console.error("\n❌ Security headers verification FAILED");
  process.exit(1);
}

console.log("✓ Security headers are consistent and secure.\n");
