/* ============================================================
 * Cookie Policy — JSON-LD schema (SEO/AEO/GEO)
 * ============================================================ */

export const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://ahadex.online/cookie-policy#page",
  url: "https://ahadex.online/cookie-policy",
  name: "Cookie Policy",
  description: "How AHADEX Tools uses cookies.",
  inLanguage: ["en", "bn"],
  isPartOf: { "@id": "https://ahadex.online/#website" },
  publisher: { "@id": "https://ahadex.online/#organization" },
} as const;

export const FAQ = {
  en: [
    {
      q: "Do you use cookies to run the tools?",
      a: "No. All tools work without any cookie. Preferences are stored in localStorage.",
    },
    {
      q: "Can I block analytics without breaking the site?",
      a: "Yes. Blocking Google Analytics has no effect on any tool.",
    },
  ],
  bn: [
    {
      q: "টুল চালাতে কি কুকি লাগে?",
      a: "না। সব টুল কোনো কুকি ছাড়াই চলে। পছন্দগুলো localStorage-এ সংরক্ষিত হয়।",
    },
    {
      q: "Analytics ব্লক করলে সাইট ভাঙবে?",
      a: "না। Google Analytics ব্লক করলে কোনো টুলে প্রভাব পড়ে না।",
    },
  ],
} as const;
