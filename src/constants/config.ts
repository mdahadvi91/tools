export const APP_CONFIG = {
  name: "AHADEX Tools",
  shortName: "AHADEX",
  description:
    "Free, fast and private online tools for everyday digital tasks. Everything runs in your browser.",
  version: "1.0.0",
  domain: "ahadex.online",
  url: "https://ahadex.online",
  email: "mdahadvi91@gmail.com",
  github: "https://github.com/mdahadvi91/tools",
  githubOwner: "mdahadvi91",
  githubRepo: "tools",
} as const;

export const STORAGE_KEYS = {
  theme: "ahadex-theme",
  language: "ahadex-language",
  sound: "ahadex-sound",
  buddyDismissed: "ahadex-buddy-dismissed",
  cookieConsent: "ahadex-cookie-consent",
  recentlyUsed: "ahadex-recently-used",
} as const;

export const DEFAULT_THEME = "system" as const;
export const DEFAULT_LANGUAGE = "en" as const;

export const FEATURE_FLAGS = {
  enableAdSense: import.meta.env?.VITE_ENABLE_ADSENSE === "true",

  /**
   * Affiliate product recommendations.
   * Disabled by default pending AdSense approval. AdSense review
   * guidance treats affiliate placements as monetization noise when
   * they are not tightly matched to the page purpose. Once the site
   * is approved, set VITE_ENABLE_AFFILIATE_RECOMMENDATIONS=true in
   * the production environment to re-enable them.
   */
  enableAffiliateRecommendations:
    import.meta.env?.VITE_ENABLE_AFFILIATE_RECOMMENDATIONS === "true",
} as const;

