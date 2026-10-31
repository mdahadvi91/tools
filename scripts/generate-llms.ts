import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { tools } from "../src/data/tools";

const ROOT = process.cwd();
const SITE_URL = "https://ahadex.online";

// 1. Header
let content = `# AHADEX Tools\n\n`;
content += `> AHADEX Tools is a privacy-first, 100% client-side browser tool suite designed for everyday digital tasks such as image editing, document generation, and design utility processing. All files and user data are processed locally in the browser; nothing is uploaded to a server.\n\n`;

// 2. Tools
content += `## Core Tools\n\n`;
for (const tool of tools) {
  content += `- [${tool.name}](${SITE_URL}${tool.path}): ${tool.description}\n`;
}

// 3. Static Pages
content += `\n## Important Pages\n\n`;
content += `- [About](${SITE_URL}/about): Learn more about AHADEX Tools and our mission.\n`;
content += `- [Privacy Policy](${SITE_URL}/privacy): Understand how your data is handled (locally, no uploads).\n`;
content += `- [Terms of Service](${SITE_URL}/terms): Usage terms and conditions.\n`;

// 4. Optional: Technical info
content += `\n## Optional\n\n`;
content += `- [Sitemap](${SITE_URL}/sitemap.xml): Complete sitemap for search engines.\n`;

writeFileSync(resolve(ROOT, "public/llms.txt"), content, "utf-8");
console.log("✅ public/llms.txt generated.");
