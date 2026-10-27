/* ============================================================
 * Header — UI strings (bilingual)
 * ============================================================ */

export const CONTENT = {
  en: {
    menu: "Open menu",
    settings: "Open settings",
    searchOpen: "Open search",
    searchClose: "Close search",
    searchLabel: "Search",
    searchPlaceholder: "Search tools — try 'JPG', 'PDF merge', 'QR'...",
    version: "v1.0",
  },
  bn: {
    menu: "মেনু খুলুন",
    settings: "সেটিংস খুলুন",
    searchOpen: "সার্চ খুলুন",
    searchClose: "সার্চ বন্ধ করুন",
    searchLabel: "সার্চ",
    searchPlaceholder: "টুল খুঁজুন — যেমন 'JPG', 'PDF merge', 'QR'...",
    version: "v1.0",
  },
} as const;

export type HeaderLang = keyof typeof CONTENT;
