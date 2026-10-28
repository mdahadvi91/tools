/* ============================================================
 * AUTO-GENERATED RE-EXPORT
 * Source of truth: src/data/tools.ts
 * This file now derives content from the central registry to
 * maintain a single source of truth across React UI and SSR.
 * ============================================================ */

import { tools } from "@/data/tools";

const tool = tools.find((t) => t.id === "color-picker")!;

// Convert registry's howTo format ({step, title, description}) to content.ts format ({title, description})
const howTo = tool.howTo.map((h) => ({ title: h.title, description: h.description }));

// Convert registry's features to content.ts format
const features = tool.features || [];

// Convert registry's faq to content.ts format
const faq = tool.faq || [];

export const colorPickerContent = {
  en: {
    heroTag: "Runs Entirely in Browser",
    heroSubtitle: tool.description,
    privacyNote: "Your files are processed locally in your browser. They are never transmitted to any server.",
    howTo,
    features,
    faq,
  },
  bn: {
    heroTag: tool.nameBn || tool.name,
    heroSubtitle: tool.descriptionBn || tool.description,
    privacyNote: "আপনার ফাইল ব্রাউজারেই প্রসেস হয়। কোনো সার্ভারে আপলোড হয় না।",
    howTo,
    features,
    faq,
  },
};
