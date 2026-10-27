/* ============================================================
 * Header — Navigation links (bilingual)
 * ------------------------------------------------------------
 * Single source of truth for the top navigation bar.
 * Both English and Bengali labels live here so the Header
 * component never has to hardcode text.
 * ============================================================ */

export interface NavLinkItem {
  /** Route path, also used as the React key. */
  to: string;
  /** Display label per language. */
  label: { en: string; bn: string };
}

export const NAV_LINKS: NavLinkItem[] = [
  { to: "/tools",   label: { en: "Tools",   bn: "টুলস" } },
  { to: "/about",   label: { en: "About",   bn: "সম্পর্কে" } },
  { to: "/contact", label: { en: "Contact", bn: "যোগাযোগ" } },
];
