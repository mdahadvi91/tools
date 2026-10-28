import { readFileSync, writeFileSync, readdirSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OG_DIR = resolve(ROOT, "public/images/og/tools");

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

  // Method C: Keep existing .jpg if conversion fails
  if (!success) {
    if (existsSync(jpgPath)) {
      console.log(`  ⚠️ ${svgPath.split('/').pop()?.replace('.svg', '.jpg')} kept existing (no converter available)`);
    } else {
      console.error(`  ❌ ${svgPath.split('/').pop()?.replace('.svg', '.jpg')}: no converter available`);
      return;
    }
  }

  // Cleanup
  unlinkSync(pngPath);
  unlinkSync(svgPath);
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

  console.log("✅ OG image conversion complete.\n");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
