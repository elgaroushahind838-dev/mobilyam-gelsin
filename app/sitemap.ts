import type { MetadataRoute } from "next";
import { absoluteUrl, type SeoLang } from "@/lib/seo-copy";
import { catalogProducts } from "@/lib/seo";
import { CATEGORIES } from "@/lib/types";

const PACKAGES = ["ekonomik", "standart", "premium"];

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  const languages = (["tr", "en", "ar"] as SeoLang[]).reduce<Record<string, string>>((acc, lang) => {
    acc[lang] = absoluteUrl(path, lang);
    return acc;
  }, {});
  languages["x-default"] = absoluteUrl(path, "tr");
  return {
    url: absoluteUrl(path, "tr"),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await catalogProducts();
  const paths = [
    { path: "/", priority: 1 },
    ...CATEGORIES.map((category) => ({ path: `/kategori/${category.slug}`, priority: 0.8 })),
    ...PACKAGES.map((slug) => ({ path: `/paket/${slug}`, priority: 0.7 })),
    ...products.map((product) => ({ path: `/urun/${product.slug}`, priority: 0.6 })),
  ];
  return paths.map((item) => entry(item.path, item.priority));
}
