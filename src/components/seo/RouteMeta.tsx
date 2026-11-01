import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { TOOL_META, STATIC_META } from "../../../functions/_data";

const SITE = "https://ahadex.online";

type Meta = { title: string; description: string; ogImage?: string };
const ALL = { ...(TOOL_META as unknown as Record<string, Meta>), ...(STATIC_META as unknown as Record<string, Meta>) };

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Keeps tab title + meta in sync when the user navigates inside the SPA. */
export function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
    const meta = ALL[path];

    if (!meta) {
      setMeta("name", "robots", "noindex, nofollow");
      return;
    }

    const url = `${SITE}${path === "/" ? "/" : path}`;
    const img = meta.ogImage
      ? meta.ogImage.startsWith("http") ? meta.ogImage : `${SITE}${meta.ogImage}`
      : `${SITE}/images/og/default-og.png`;

    document.title = meta.title;
    setMeta("name", "robots", "index, follow");
    setMeta("name", "description", meta.description);
    setCanonical(url);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", img);
  }, [pathname]);

  return null;
}
