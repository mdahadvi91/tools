import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OG_DIR = resolve(ROOT, "public/images/og/tools");

console.log("▶ Converting SVG OG images to JPG...");

const files = readdirSync(OG_DIR).filter(f => f.endsWith(".svg"));

for (const file of files) {
  const svgPath = resolve(OG_DIR, file);
  const svgCode = readFileSync(svgPath, "utf-8");
  
  try {
    const resvg = new Resvg(svgCode, {
      fitTo: { mode: "width", value: 1200 },
      background: "#0A1024", // Fallback background
    });
    
    // Render as PNG (resvg outputs PNG buffer)
    const pngData = resvg.render().asPng();
    
    // We save as .png. Social media platforms fully support PNG.
    const pngPath = svgPath.replace(".svg", ".png");
    writeFileSync(pngPath, pngData);
    
    console.log(`  ✓ Converted ${file} → ${file.replace('.svg', '.png')}`);
  } catch (err) {
    console.error(`  ❌ Failed to convert ${file}:`, err);
  }
}

console.log("✅ OG image conversion complete.\n");
