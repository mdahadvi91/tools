/* ============================================================
 * Footer — navigation sections (bilingual)
 * ============================================================ */

export interface FooterLink {
  to: string;
  label: { en: string; bn: string };
  external?: boolean;
}

export interface FooterSection {
  title: { en: string; bn: string };
  links: FooterLink[];
}

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: { en: "Tools", bn: "টুলস" },
    links: [
      { to: "/tools", label: { en: "All Tools", bn: "সব টুলস" } },
      { to: "/tools/cv-builder", label: { en: "CV Builder", bn: "সিভি বিল্ডার" } },
      { to: "/tools/visiting-card", label: { en: "Visiting Card", bn: "ভিজিটিং কার্ড" } },
      { to: "/tools/photo-qr", label: { en: "Photo QR", bn: "ফটো কিউআর" } },
    ],
  },
  {
    title: { en: "Company", bn: "কোম্পানি" },
    links: [
      { to: "/about", label: { en: "About", bn: "সম্পর্কে" } },
      { to: "/contact", label: { en: "Contact", bn: "যোগাযোগ" } },
      {
        to: "https://github.com/mdahadvi91/tools",
        label: { en: "GitHub", bn: "GitHub" },
        external: true,
      },
    ],
  },
  {
    title: { en: "Legal", bn: "আইনি" },
    links: [
      { to: "/privacy", label: { en: "Privacy", bn: "প্রাইভেসি" } },
      { to: "/terms", label: { en: "Terms", bn: "শর্তাবলী" } },
      { to: "/disclaimer", label: { en: "Disclaimer", bn: "ডিসক্লেইমার" } },
      { to: "/cookie-policy", label: { en: "Cookies", bn: "কুকিজ" } },
    ],
  },
];
