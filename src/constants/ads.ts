/**
 * AdSense ad-unit slot IDs.
 *
 * Real slot IDs come from AdSense dashboard:
 *   Ads → By ad unit → click your ad unit → "data-ad-slot" value
 * They are always 10-digit numeric strings (e.g. "1234567890").
 *
 * Leave a value as an empty string ("") to disable that ad placement.
 * The <AdSenseSlot /> component ignores any non-10-digit value, so
 * placeholders can never trigger broken ad requests during review.
 *
 * When AdSense approves the account and creates ad units, replace the
 * empty strings below with real numeric slot IDs. Nothing else needs
 * to change — every ad placement reads from this file.
 */
export const AD_SLOTS = {
  /** Top of the page, below the header (all pages). */
  topBanner: "",
  /** Bottom of the page, above the footer (all pages). */
  bottomBanner: "",
  /** Below the content of an individual tool page. */
  toolBottom: "",
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
