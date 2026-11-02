/* ============================================================
 * generate-headers.ts — build-time generator
 * ------------------------------------------------------------
 * Regenerates the derived header files from
 * scripts/security-headers.ts. Never edit outputs by hand.
 *
 * Outputs:
 *   public/_headers
 *   functions/_security-headers.generated.ts
 * ============================================================ */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BASE_SECURITY_HEADERS,
  renderHeadersFile,
} from "./security-headers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// 1. public/_headers
writeFileSync(resolve(ROOT, "public/_headers"), renderHeadersFile());
console.log("  ✓ public/_headers");

// 2. functions/_security-headers.generated.ts
const generated = `/* ============================================================
 * AUTO-GENERATED — do not edit.
 * Source: scripts/security-headers.ts
 * Regenerate: npm run generate:headers
 * ============================================================ */

export const SECURITY_HEADERS: Record<string, string> = ${JSON.stringify(BASE_SECURITY_HEADERS, null, 2)} as const;
`;
writeFileSync(
  resolve(ROOT, "functions/_security-headers.generated.ts"),
  generated
);
console.log("  ✓ functions/_security-headers.generated.ts");

console.log("✅ Security headers generated from single source.\n");
