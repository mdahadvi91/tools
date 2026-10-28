import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OG_DIR = resolve(ROOT, "public/images/og/tools");

console.log("▶ Converting SVG OG images to JPG...");

const files = readdirSync(OG_DIR).filter(f => f.endsWith(".svg"));

for (const file of files) {
  const svgPath = resolve(OG_DIR, file);
  const pngPath = svgPath.replace(".svg", ".png");
  const jpgPath = svgPath.replace(".svg", ".jpg");
  const svgCode = readFileSync(svgPath, "utf-8");
  
  try {
    // Step 1: Convert SVG to PNG using resvg
    const resvg = new Resvg(svgCode, {
      fitTo: { mode: "width", value: 1200 },
      background: "#0A1024",
    });
    const pngData = resvg.render().asPng();
    writeFileSync(pngPath, pngData);

    // Step 2: Convert PNG to JPG using ImageMagick
    execSync(`convert "${pngPath}" -background "#0A1024" -flatten -quality 95 "${jpgPath}"`);
    
    // Cleanup intermediate files (keep only JPG)
    unlinkSync(svgPath);
    unlinkSync(pngPath);

    console.log(`  ✓ Generated ${file.replace('.svg', '.jpg')}`);
  } catch (err) {
    console.error(`  ❌ Failed to convert ${file}:`, err);
  }
}

console.log("✅ OG image conversion complete. Only JPGs remain.\n");
