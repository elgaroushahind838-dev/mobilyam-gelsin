"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { flushTracking, productSlugFromPath, track } from "@/lib/track";

export default function CatalogTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flushTracking();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flushTracking);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flushTracking);
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const path = pathname.slice(0, 180);
    track({ type: "page_view", path });
    const product = productSlugFromPath(path);
    if (product) track({ type: "product_view", path, product, section: path.startsWith("/paket/") ? "package" : "product" });
  }, [pathname]);

  useEffect(() => {
    const seen = new Set<string>();
    const click = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const marked = target.closest("[data-track]");
      const card = target.closest("[data-track-card]");
      const link = target.closest("a");
      const href = link?.getAttribute("href") || "";
      const path = window.location.pathname.slice(0, 180);
      const product = marked?.getAttribute("data-track-product") || card?.getAttribute("data-track-card") || productSlugFromPath(path);
      const section = marked?.getAttribute("data-track-section") || card?.getAttribute("data-track-section") || "";
      if (marked?.getAttribute("data-track") === "whatsapp" || href.includes("wa.me")) {
        track({ type: "whatsapp", path, product, section: section || (product ? "product" : "footer") });
        return;
      }
      if (href.startsWith("tel:")) {
        track({ type: "phone", path, section: "footer" });
        return;
      }
      if (href.includes("maps.app.goo.gl") || href.includes("maps.google") || href.includes("google.com/maps")) {
        track({ type: "map", path, section: "contact" });
        return;
      }
      if (card) {
        track({ type: "card_click", path, product, section: section || "card" });
        return;
      }
      if (href.startsWith("/urun/")) {
        const slug = productSlugFromPath(href);
        track({ type: "card_click", path, product: slug, section: link?.getAttribute("data-track-section") || "catalog" });
      }
    };
    document.addEventListener("click", click);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target;
          if (!(element instanceof HTMLElement)) continue;
          const product = element.dataset.trackImpression || "";
          const key = `${product}:${element.dataset.trackSection || ""}`;
          if (!product || seen.has(key)) continue;
          seen.add(key);
          observer.unobserve(element);
          track({
            type: "impression",
            path: window.location.pathname.slice(0, 180),
            product,
            section: element.dataset.trackSection || "card",
          });
        }
      },
      { threshold: 0.5 },
    );
    let frame = 0;
    const watch = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        document.querySelectorAll<HTMLElement>("[data-track-impression]").forEach((element) => observer.observe(element));
      });
    };
    watch();
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("click", click);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
