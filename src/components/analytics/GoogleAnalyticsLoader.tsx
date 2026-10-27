import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function GoogleAnalyticsLoader() {
  useEffect(() => {
    const enabled = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
    const measurementId = (
      import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined
    )?.trim();

    // If not configured, do nothing.
    if (!enabled || !measurementId) return;

    // 1. Initialize dataLayer + gtag stub
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer!.push(args);
      };
    }

    // 2. If already loaded, do nothing.
    if (
      document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
    ) {
      return;
    }

    // 3. Load GA4. Consent Mode v2 defaults (denied) are already set inline
    // in index.html. GA will not drop cookies until the Google CMP updates
    // the consent signals.
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      send_page_view: false,
      anonymize_ip: true,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);
  }, []);

  return null;
}
