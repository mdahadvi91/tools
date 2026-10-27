/* ============================================================
 * Footer — all text (bilingual)
 * ============================================================ */

export const CONTENT = {
  en: {
    supportBadge: "Support the project",
    supportTitle1: "Love the tools?",
    supportTitle2: "Buy me a coffee.",
    supportDesc: "Your small support helps me keep building free tools for everyone.",
    supportCta: "Buy a coffee",
    tagline:
      "Free, fast, and private browser-based tools for everyday digital tasks.",
    badge: "Completely Free",
    copyright: "All rights reserved.",
    madeWith: "Made with",
    backToTop: "Top",
    sectionTools: "Tools",
    sectionCompany: "Company",
    sectionLegal: "Legal",
    tools: {
      cvBuilder: "CV Builder",
      visitingCard: "Visiting Card",
      photoQr: "Photo QR",
    },
    legal: {
      cookies: "Cookies",
    },
  },
  bn: {
    supportBadge: "সমর্থন করুন",
    supportTitle1: "ভালো লাগলে ",
    supportTitle2: "কফি খাইয়ে দিন।",
    supportDesc:
      "আপনার ছোট একটা সাপোর্ট আমাকে নতুন ফ্রি টুল বানাতে সাহায্য করে।",
    supportCta: "কফি কিনুন",
    tagline:
      "প্রতিদিনের কাজের জন্য ফ্রি, দ্রুত ও প্রাইভেট ব্রাউজার-ভিত্তিক টুলস।",
    badge: "সম্পূর্ণ ফ্রি",
    copyright: "সব অধিকার সংরক্ষিত।",
    madeWith: "বানানো হয়েছে",
    backToTop: "উপরে",
    sectionTools: "টুলস",
    sectionCompany: "কোম্পানি",
    sectionLegal: "আইনি",
    tools: {
      cvBuilder: "সিভি বিল্ডার",
      visitingCard: "ভিজিটিং কার্ড",
      photoQr: "ফটো কিউআর",
    },
    legal: {
      cookies: "কুকিজ",
    },
  },
} as const;

export type FooterLang = keyof typeof CONTENT;
