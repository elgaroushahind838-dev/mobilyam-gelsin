import type { Metadata } from "next";
import { SEED_PRODUCTS } from "./seed-products";
import { absoluteUrl, NAP, pageCopy, seoLang, SITE_URL, type SeoLang } from "./seo-copy";
import { subtypeSeo } from "./subtypes";
import { getStore } from "./store";
import { CATEGORY_COPY } from "./types";

export async function catalogProducts() {
  try {
    return await getStore().listProducts();
  } catch {
    return SEED_PRODUCTS;
  }
}

export async function metadataFor(pathname: string, langValue: string | null, subtype = ""): Promise<Metadata> {
  const lang = seoLang(langValue);
  const product = await productFromPath(pathname);
  const wedding = await packageFromPath(pathname);
  const focused = subtype ? subtypeSeo(subtype) : null;
  const copy = focused
    ? focused[lang]
    : wedding
    ? {
        title: `${wedding.name[lang]} | Düğün Paketi Mobilya İstanbul | Mobilyam Gelsin`,
        description: wedding.description[lang] || wedding.bedroomDescription[lang],
      }
    : pageCopy(pathname, lang, product?.name, product?.description);
  const extra = subtype ? { tur: subtype } : undefined;
  const canonical = absoluteUrl(pathname || "/", lang, extra);
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        tr: absoluteUrl(pathname || "/", "tr", extra),
        en: absoluteUrl(pathname || "/", "en", extra),
        ar: absoluteUrl(pathname || "/", "ar", extra),
        "x-default": absoluteUrl(pathname || "/", "tr", extra),
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: NAP.name,
      title: copy.title,
      description: copy.description,
      locale: lang === "en" ? "en_US" : lang === "ar" ? "ar_AR" : "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
    },
  };
}

export function localBusiness() {
  return {
    "@context": "https://schema.org",
    "@type": ["FurnitureStore", "LocalBusiness"],
    name: NAP.name,
    url: SITE_URL,
    telephone: NAP.phoneE164,
    email: NAP.email,
    image: `${SITE_URL}/images/mobilyamlogo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: NAP.streetAddress,
      addressLocality: NAP.locality,
      addressRegion: NAP.locality,
      postalCode: NAP.postalCode,
      addressCountry: "TR",
    },
    areaServed: { "@type": "City", name: "İstanbul" },
  };
}

export async function structuredData(pathname: string, langValue: string | null) {
  const lang = seoLang(langValue);
  const blocks: Record<string, unknown>[] = [localBusiness()];
  const crumbs = await breadcrumbs(pathname, lang);
  if (crumbs) blocks.push(crumbs);
  const product = await productSchema(pathname);
  if (product) blocks.push(product);
  return blocks;
}

async function packageFromPath(pathname: string) {
  const match = pathname.match(/^\/paket\/([^/]+)\/?$/);
  if (!match) return null;
  try {
    const item = await getStore().getPackage(match[1]);
    return item?.active ? item : null;
  } catch {
    return null;
  }
}

async function productFromPath(pathname: string) {
  const match = pathname.match(/^\/urun\/([^/]+)\/?$/);
  if (!match) return null;
  const products = await catalogProducts();
  return products.find((item) => item.slug === match[1]) ?? null;
}

async function productSchema(pathname: string) {
  const product = await productFromPath(pathname);
  if (!product) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => (src.startsWith("http") ? src : `${SITE_URL}${src}`)),
    brand: { "@type": "Brand", name: NAP.name },
    category: product.categoryLabel,
    url: absoluteUrl(`/urun/${product.slug}`, "tr"),
  };
}

async function breadcrumbs(pathname: string, lang: SeoLang) {
  const items: { name: string; path: string }[] = [{ name: lang === "en" ? "Home" : lang === "ar" ? "الرئيسية" : "Ana Sayfa", path: "/" }];
  const category = pathname.match(/^\/kategori\/([^/]+)\/?$/);
  const productMatch = pathname.match(/^\/urun\/([^/]+)\/?$/);
  const pack = pathname.match(/^\/paket\/([^/]+)\/?$/);
  if (category) {
    const copy = CATEGORY_COPY[category[1] as keyof typeof CATEGORY_COPY];
    items.push({ name: copy ? copy[lang === "en" ? "EN" : lang === "ar" ? "AR" : "TR"] : category[1], path: `/kategori/${category[1]}` });
  } else if (pack) {
    items.push({
      name: lang === "en" ? "Wedding packages" : lang === "ar" ? "باقات الزفاف" : "Düğün Paketleri",
      path: `/paket/${pack[1]}`,
    });
  } else if (productMatch) {
    const product = await productFromPath(pathname);
    if (product) {
      const copy = CATEGORY_COPY[product.categorySlug as keyof typeof CATEGORY_COPY];
      if (copy) {
        items.push({
          name: copy[lang === "en" ? "EN" : lang === "ar" ? "AR" : "TR"],
          path: `/kategori/${product.categorySlug}`,
        });
      }
      items.push({ name: product.name, path: `/urun/${product.slug}` });
    }
  } else {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, lang),
    })),
  };
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
