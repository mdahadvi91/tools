/* ============================================================
 * Cookie Policy — SEO metadata (bilingual)
 * ============================================================ */

export const SEO = {
  en: {
    title: "Cookie Policy — How AHADEX Tools Uses Cookies",
    description:
      "How AHADEX Tools uses cookies — the minimum needed to keep the site working. No tracking beyond anonymous analytics and Google AdSense.",
    canonical: "https://ahadex.online/cookie-policy",
    ogImage: "https://ahadex.online/images/og/default-og.png",
    keywords: ["cookie policy", "cookies", "AHADEX Tools", "GDPR"],
  },
  bn: {
    title: "কুকি পলিসি — AHADEX Tools কীভাবে কুকি ব্যবহার করে",
    description:
      "AHADEX Tools কীভাবে কুকি ব্যবহার করে — শুধু যতটুকু সাইট চালানোর জন্য দরকার। Anonymous analytics আর Google AdSense ছাড়া কোনো ট্র্যাকিং নেই।",
    canonical: "https://ahadex.online/bn/cookie-policy",
    ogImage: "https://ahadex.online/images/og/default-og.png",
    keywords: ["কুকি পলিসি", "কুকি", "AHADEX Tools", "GDPR"],
  },
} as const;

export type CookieSeoLang = keyof typeof SEO;
