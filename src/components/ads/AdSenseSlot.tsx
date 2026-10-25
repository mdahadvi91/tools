import { useEffect, useRef, useState } from "react";
import { subscribeToConsent } from "@lib/consent";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseSlotProps {
  /**
   * Real AdSense ad-unit slot ID (10-digit numeric string).
   * Get it from AdSense dashboard → Ads → By ad unit → your unit → data-ad-slot.
   * Placeholder / non-numeric values are ignored (no ad is rendered).
   */
  slot: string;
  label?: string;
}

/** Real AdSense slot IDs are exactly 10 digits. Anything else is a placeholder. */
const SLOT_ID_RE = /^\d{10}$/;
const isValidSlotId = (s: string): boolean => SLOT_ID_RE.test(s);

export function AdSenseSlot({ slot, label }: AdSenseSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [hasAdsConsent, setHasAdsConsent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const valid = isValidSlotId(slot);

  // Warn once in dev when a placeholder slot is used, so it is easy to spot.
  useEffect(() => {
    if (!valid && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[AdSenseSlot] Ignoring invalid slot ID "${slot}". ` +
          `Real AdSense slot IDs are 10-digit numbers. ` +
          `Set a real slot ID in the component that renders this ad.`
      );
    }
  }, [valid, slot]);

  // 1. Consent subscription (unchanged)
  useEffect(() => {
    const unsubscribe = subscribeToConsent((state) => {
      setHasAdsConsent(!!state?.ads);
    });
    return unsubscribe;
  }, []);

  // 2. Detect whether the AdSense script from index.html has loaded.
  useEffect(() => {
    if (window.adsbygoogle) {
      setScriptLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.adsbygoogle) {
        setScriptLoaded(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 3. Lazy-load the ad unit only when visible + consent + valid slot.
  useEffect(() => {
    if (!valid || !hasAdsConsent || !adRef.current || !scriptLoaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [valid, hasAdsConsent, scriptLoaded]);

  // 4. Push to AdSense — only for valid slot IDs.
  useEffect(() => {
    if (!valid) return;
    if (isVisible && hasAdsConsent && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, [valid, isVisible, hasAdsConsent]);

  // Hard gates:
  // - no consent → nothing
  // - invalid slot ID (placeholder) → nothing (avoids broken ad requests
  //   that can count against the site during AdSense review)
  if (!hasAdsConsent) return null;
  if (!valid) return null;

  return (
    <div className="my-6 flex flex-col items-center justify-center min-h-[100px] bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {label && (
        <span className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 opacity-50">
          {label}
        </span>
      )}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: "90px" }}
        data-ad-client="ca-pub-5216241068377334"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
