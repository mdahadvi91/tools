import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OG_DIR = resolve(ROOT, "public/images/og/tools");
const FONT_DIR = resolve(__dirname, "assets/fonts");
const FONT_FILES = [
  resolve(FONT_DIR, "NotoSans-Regular.ttf"),
  resolve(FONT_DIR, "NotoSans-Bold.ttf"),
];

// Detect if ImageMagick is available (Termux) or not (Cloudflare)
function hasImageMagick(): boolean {
  try {
    execSync("which magick || which convert", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Try to import sharp (may fail on Termux)
async function trySharp(): Promise<any | null> {
  try {
    const sharp = await import("sharp");
    return sharp.default;
  } catch {
    return null;
  }
}

async function convertToJpg(svgPath: string): Promise<void> {
  const pngPath = svgPath.replace(".svg", ".png");
  const jpgPath = svgPath.replace(".svg", ".jpg");
  const svgCode = readFileSync(svgPath, "utf-8");

  // Step 1: SVG → PNG via resvg (always works)
  const resvg = new Resvg(svgCode, {
    fitTo: { mode: "width", value: 1200 },
    background: "#0A1024",
    font: {
      fontFiles: FONT_FILES,
      loadSystemFonts: false,
      defaultFontFamily: "Noto Sans",
      sansSerifFamily: "Noto Sans",
    },
  });
  const pngData = resvg.render().asPng();
  writeFileSync(pngPath, pngData);

  // Step 2: PNG → JPG (try 3 methods)
  let success = false;

  // Method A: ImageMagick (Termux)
  if (hasImageMagick()) {
    try {
      const cmd = execSync("which magick", { stdio: "pipe" }).toString().trim() ? "magick" : "convert";
      execSync(`${cmd} "${pngPath}" -background "#0A1024" -flatten -quality 95 "${jpgPath}"`);
      success = true;
      console.log(`  ✓ ${svgPath.split('/').pop()?.replace('.svg', '.jpg')} (via ImageMagick)`);
    } catch (e) {
      // Fall through to sharp
    }
  }

  // Method B: sharp (Cloudflare CI, cross-platform)
  if (!success) {
    const sharp = await trySharp();
    if (sharp) {
      try {
        await sharp(pngData).jpeg({ quality: 95 }).toFile(jpgPath);
        success = true;
        console.log(`  ✓ ${svgPath.split('/').pop()?.replace('.svg', '.jpg')} (via sharp)`);
      } catch (e) {
        // Fall through to skip
      }
    }
  }

  // Method C: HARD FAIL — never silently keep stale JPGs
  if (!success) {
    if (existsSync(pngPath)) unlinkSync(pngPath);
    throw new Error(`No converter available for ${svgPath.split('/').pop()}`);
  }

  // Cleanup (wrapped so unlink failure doesn't corrupt pipeline)
  try {
    if (existsSync(pngPath)) unlinkSync(pngPath);
    if (existsSync(svgPath)) unlinkSync(svgPath);
  } catch (e) {
    console.warn(`  ⚠️ Cleanup warning: ${(e as Error).message}`);
  }
}

async function main() {
  console.log("▶ Converting SVG OG images to JPG...");
  
  const files = readdirSync(OG_DIR).filter(f => f.endsWith(".svg"));
  
  if (files.length === 0) {
    console.log("  ⚠️ No SVG files to convert (JPGs already exist).");
  } else {
    for (const file of files) {
      try {
        await convertToJpg(resolve(OG_DIR, file));
      } catch (err) {
        console.error(`  ❌ Failed ${file}:`, (err as Error).message);
      }
    }
  }

  // HARD VERIFY: every JPG must be unique (catches silent placeholder bugs)
  const { createHash } = await import("node:crypto");
  const jpgs = readdirSync(OG_DIR).filter(f => f.endsWith(".jpg"));
  const hashes = new Map<string, string>();
  for (const f of jpgs) {
    const hash = createHash("md5").update(readFileSync(resolve(OG_DIR, f))).digest("hex");
    const prev = hashes.get(hash);
    if (prev) {
      throw new Error(`Duplicate OG JPG detected: ${f} === ${prev} (both ${hash}). Conversion failed silently.`);
    }
    hashes.set(hash, f);
  }
  console.log(`  ✓ Verified: ${jpgs.length} unique JPGs (all distinct)`);
  console.log("✅ OG image conversion complete.\n");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
