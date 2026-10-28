/* ============================================================
 * scripts/content-audit.ts
 * ------------------------------------------------------------
 * Independent content quality audit:
 * - Detects template-driven filler content
 * - Verifies tool-specific uniqueness
 * - Flags generic phrases
 * ============================================================ */

import { tools } from "../src/data/tools";

interface AuditResult {
  tool: string;
  issues: string[];
  warnings: string[];
  passes: string[];
}

const GENERIC_PHRASES = [
  "in today's digital world",
  "whether you are a",
  "look no further",
  "cutting-edge",
  "state-of-the-art",
  "revolutionize",
  "game-changer",
  "unlock the power",
  "seamlessly",
  "100% private",
  "100% secure",
  "no hidden limits",
  "unlimited",
  "world-class",
];

const PRIVACY_CLAIMS = ["100% private", "100% secure", "never leaves", "completely safe", "no data collection", "fully secure"];

const results: AuditResult[] = [];

for (const tool of tools) {
  const r: AuditResult = { tool: tool.name, issues: [], warnings: [], passes: [] };
  
  // 1. Check for generic phrases in description
  const descLower = (tool.description + " " + tool.longDescription).toLowerCase();
  for (const phrase of GENERIC_PHRASES) {
    if (descLower.includes(phrase)) {
      r.issues.push(`Generic phrase in description: "${phrase}"`);
    }
  }
  if (r.issues.length === 0) r.passes.push("No generic phrases in description");
  
  // 2. Check for exaggerated privacy claims
  const longLower = tool.longDescription.toLowerCase();
  for (const claim of PRIVACY_CLAIMS) {
    if (longLower.includes(claim)) {
      r.issues.push(`Exaggerated privacy claim: "${claim}" (should be 'client-side' or 'processed locally')`);
    }
  }
  if (!r.issues.some(i => i.includes("privacy claim"))) r.passes.push("No exaggerated privacy claims");
  
  // 3. Verify FAQ count and specificity
  if (!tool.faq || tool.faq.length < 3) {
    r.warnings.push(`Only ${tool.faq?.length || 0} FAQs (recommend ≥3)`);
  } else {
    r.passes.push(`${tool.faq.length} FAQs present`);
    
    // Check FAQ uniqueness: each question should be specific
    const genericQuestions = ["is this free", "is it free", "how does it work", "what is this"];
    for (const faq of tool.faq) {
      const q = faq.question.toLowerCase();
      for (const gq of genericQuestions) {
        if (q.includes(gq) && q.length < 30) {
          r.warnings.push(`Generic FAQ: "${faq.question}"`);
        }
      }
    }
  }
  
  // 4. Verify limitations are present and specific
  if (!tool.limitations || tool.limitations.length === 0) {
    r.issues.push("No limitations listed (required for E-E-A-T)");
  } else {
    r.passes.push(`${tool.limitations.length} limitations documented`);
    // Check for overly generic limitations
    for (const lim of tool.limitations) {
      if (lim.length < 20) {
        r.warnings.push(`Very short limitation: "${lim}"`);
      }
    }
  }
  
  // 5. Verify use cases are present and unique
  if (!tool.useCases || tool.useCases.length === 0) {
    r.issues.push("No use cases listed");
  } else {
    r.passes.push(`${tool.useCases.length} use cases documented`);
    // Check for duplicate use cases across tools
  }
  
  // 6. Verify HowTo steps are tool-specific
  if (!tool.howTo || tool.howTo.length < 3) {
    r.issues.push(`Only ${tool.howTo?.length || 0} HowTo steps (recommend ≥3)`);
  } else {
    r.passes.push(`${tool.howTo.length} HowTo steps`);
    // Check for generic step text
    for (const step of tool.howTo) {
      if (step.description.length < 30) {
        r.warnings.push(`Short step description: "${step.title}"`);
      }
    }
  }
  
  // 7. Verify features are specific (not just rephrased description)
  if (!tool.features || tool.features.length < 3) {
    r.warnings.push(`Only ${tool.features?.length || 0} features (recommend ≥3)`);
  } else {
    r.passes.push(`${tool.features.length} features documented`);
    // Check for features that are just rephrased descriptions
    for (const f of tool.features) {
      if (f.description.length < 20) {
        r.warnings.push(`Short feature description: "${f.title}"`);
      }
    }
  }
  
  // 8. Check for "100% private" being replaced by "client-side" or "processed locally"
  const allText = [tool.description, tool.longDescription, ...(tool.features?.map(f => f.description) || [])].join(" ").toLowerCase();
  if (allText.includes("client-side") || allText.includes("processed locally") || allText.includes("in your browser")) {
    r.passes.push("Uses accurate 'client-side' wording");
  } else {
    r.warnings.push("Missing 'client-side' or 'processed locally' phrasing");
  }
  
  results.push(r);
}

// Detect duplicate use cases across tools
const useCaseMap = new Map<string, string[]>();
for (const tool of tools) {
  for (const uc of tool.useCases || []) {
    const existing = useCaseMap.get(uc) || [];
    existing.push(tool.name);
    useCaseMap.set(uc, existing);
  }
}
for (const [uc, toolNames] of useCaseMap.entries()) {
  if (toolNames.length > 1) {
    for (const r of results) {
      if (toolNames.includes(r.tool)) {
        r.issues.push(`Duplicate use case shared with ${toolNames.filter(n => n !== r.tool).join(", ")}: "${uc.substring(0, 50)}"`);
      }
    }
  }
}

// Detect duplicate features across tools
const featureMap = new Map<string, string[]>();
for (const tool of tools) {
  for (const f of tool.features || []) {
    const existing = featureMap.get(f.title) || [];
    existing.push(tool.name);
    featureMap.set(f.title, existing);
  }
}
for (const [title, toolNames] of featureMap.entries()) {
  if (toolNames.length > 1) {
    for (const r of results) {
      if (toolNames.includes(r.tool)) {
        r.warnings.push(`Shared feature title with ${toolNames.filter(n => n !== r.tool).join(", ")}: "${title}"`);
      }
    }
  }
}

// Print report
let totalIssues = 0;
let totalWarnings = 0;
let totalPasses = 0;

console.log("=".repeat(70));
console.log("🔍 CONTENT QUALITY AUDIT — 7 Tools");
console.log("=".repeat(70));

for (const r of results) {
  console.log(`\n📌 ${r.tool}`);
  console.log("─".repeat(70));
  
  if (r.issues.length > 0) {
    for (const i of r.issues) {
      console.log(`  ❌ ${i}`);
      totalIssues++;
    }
  }
  if (r.warnings.length > 0) {
    for (const w of r.warnings) {
      console.log(`  ⚠️  ${w}`);
      totalWarnings++;
    }
  }
  if (r.passes.length > 0) {
    for (const p of r.passes) {
      console.log(`  ✅ ${p}`);
      totalPasses++;
    }
  }
}

console.log("\n" + "=".repeat(70));
console.log("📊 SUMMARY");
console.log("=".repeat(70));
console.log(`Tools audited:   ${tools.length}`);
console.log(`Issues:          ${totalIssues}`);
console.log(`Warnings:        ${totalWarnings}`);
console.log(`Passes:          ${totalPasses}`);

if (totalIssues > 0) {
  console.log("\n❌ CONTENT AUDIT FAILED — fix issues above");
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log("\n🟡 CONTENT AUDIT PASSED WITH WARNINGS");
  process.exit(0);
} else {
  console.log("\n✅ CONTENT AUDIT PASSED PERFECTLY");
  process.exit(0);
}
