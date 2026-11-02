/* ============================================================
 * verify-og.ts
 * Fails CI if any two OG JPGs have identical md5 (silent placeholder bug).
 * ============================================================ */
import { readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OG_DIR = resolve(__dirname, "../public/images/og/tools");

const jpgs = readdirSync(OG_DIR).filter((f) => f.endsWith(".jpg"));
const hashes = new Map<string, string>();

for (const f of jpgs) {
  const hash = createHash("md5").update(readFileSync(resolve(OG_DIR, f))).digest("hex");
  const prev = hashes.get(hash);
  if (prev) {
    console.error(`❌ Duplicate OG JPG: ${f} === ${prev} (${hash})`);
    process.exit(1);
  }
  hashes.set(hash, f);
}

console.log(`✓ ${jpgs.length} unique OG JPGs (all distinct)`);
