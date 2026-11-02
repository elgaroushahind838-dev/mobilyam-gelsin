import type { MetadataRoute } from "next";
import { absoluteUrl, type SeoLang } from "@/lib/seo-copy";
import { catalogProducts } from "@/lib/seo";
import { getStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { SEED_PACKAGES } from "@/lib/seed-packages";
import { SEED_SUBTYPES } from "@/lib/subtypes";

function entry(path: string, priority: number, subtype = ""): MetadataRoute.Sitemap[number] {
  const extra = subtype ? { tur: subtype } : undefined;
  const languages = (["tr", "en", "ar"] as SeoLang[]).reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = absoluteUrl(path, lang, extra);
    return acc;
  }, {});
  languages["x-default"] = absoluteUrl(path, "tr", extra);
  return {
    url: absoluteUrl(path, "tr", subtype ? { tur: subtype } : undefined),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await catalogProducts();
  let packageSlugs = SEED_PACKAGES.filter((item) => item.active).map((item) => item.slug);
  try {
    packageSlugs = (await getStore().listPackages()).filter((item) => item.active).map((item) => item.slug);
  } catch {
    packageSlugs = SEED_PACKAGES.filter((item) => item.active).map((item) => item.slug);
  }
  const paths = [
    { path: "/", priority: 1 },
    ...CATEGORIES.map((category) => ({ path: `/kategori/${category.slug}`, priority: 0.8 })),
    ...SEED_SUBTYPES.map((item) => ({ path: `/kategori/${item.roomSlug}`, priority: 0.75, subtype: item.slug })),
    ...packageSlugs.map((slug) => ({ path: `/paket/${slug}`, priority: 0.7 })),
    ...products.map((product) => ({ path: `/urun/${product.slug}`, priority: 0.6 })),
  ];
  return paths.map((item) => entry(item.path, item.priority, "subtype" in item ? String(item.subtype) : ""));
}
