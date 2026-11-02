import type { L10n, ProductSubtype } from "./types";

const label = (tr: string, en: string, ar: string): L10n => ({ tr, en, ar });

export const SEED_SUBTYPES: ProductSubtype[] = [
  sub("yatak-odasi", "gardrop", label("Gardrop / Dolap", "Wardrobe", "خزانة ملابس"), 0),
  sub("yatak-odasi", "komodin", label("Komodin", "Nightstand", "كومودينة"), 1),
  sub("yatak-odasi", "yatak", label("Yatak", "Bed", "سرير"), 2),
  sub("yatak-odasi", "makyaj-masasi", label("Makyaj Masası", "Vanity Table", "طاولة زينة"), 3),
  sub("yatak-odasi", "sifonyer", label("Şifonyer", "Dresser", "تسريحة"), 4),
  sub("oturma-odasi", "koltuk", label("Koltuk", "Sofa", "كنبة"), 0),
  sub("oturma-odasi", "orta-sehpa", label("Orta Sehpa", "Coffee Table", "طاولة وسط"), 1),
  sub("oturma-odasi", "tv-unitesi", label("TV Ünitesi", "TV Unit", "وحدة تلفاز"), 2),
  sub("yemek-odasi", "yemek-masasi", label("Yemek Masası", "Dining Table", "طاولة طعام"), 0),
  sub("yemek-odasi", "vitrin", label("Vitrin", "Display Cabinet", "خزانة عرض"), 1),
  sub("genc-odasi", "ranza", label("Ranza", "Bunk Bed", "سرير بطابقين"), 0),
  sub("genc-odasi", "genc-gardrop", label("Gardrop", "Wardrobe", "خزانة"), 1),
  sub("ofis", "calisma-masasi", label("Çalışma Masası", "Desk", "مكتب"), 0),
  sub("ofis", "kitaplik", label("Kitaplık", "Bookcase", "مكتبة"), 1),
  sub("portmanto", "portmanto", label("Portmanto", "Hall Stand", "وحدة مدخل"), 0),
  sub("portmanto", "ayakkabilik", label("Ayakkabılık", "Shoe Cabinet", "خزانة أحذية"), 1),
];

function sub(roomSlug: string, slug: string, name: L10n, displayOrder: number): ProductSubtype {
  return { id: `sub-${roomSlug}-${slug}`, roomSlug, slug, label: name, displayOrder };
}

const INFER: Record<string, Record<string, string>> = {
  "yatak-odasi": {
    Gardırop: "gardrop",
    Komodin: "komodin",
    Yatak: "yatak",
    "Makyaj Masası": "makyaj-masasi",
    Şifonir: "sifonyer",
  },
  "genc-odasi": { Ranza: "ranza" },
  ofis: { Masalar: "calisma-masasi" },
  portmanto: { Portmanto: "portmanto" },
};

export function inferSubtype(roomSlug: string, tag: string): string | null {
  return INFER[roomSlug]?.[tag] ?? null;
}

export function subtypeSeo(slug: string): Record<"tr" | "en" | "ar", { title: string; description: string }> | null {
  const pages: Record<string, Record<"tr" | "en" | "ar", { title: string; description: string }>> = {
    gardrop: {
      tr: { title: "Gardrop Modelleri ve Gömme Dolap İstanbul | Mobilyam Gelsin", description: "İstanbul’da gardırop modelleri ve gömme dolap. Yatak odanıza göre atölyemizde üretilir." },
      en: { title: "Wardrobes and Fitted Closets in Istanbul | Mobilyam Gelsin", description: "Fitted wardrobes made to measure in Istanbul." },
      ar: { title: "خزائن ملابس مدمجة في إسطنبول | Mobilyam Gelsin", description: "خزائن ملابس وخزائن مدمجة تُصنع في إسطنبول." },
    },
    komodin: {
      tr: { title: "Komodin ve Başucu İstanbul | Mobilyam Gelsin", description: "Yatak odası için komodin ve başucu, İstanbul’da özel ölçüyle üretilir." },
      en: { title: "Nightstands in Istanbul | Mobilyam Gelsin", description: "Bedside tables made to measure in Istanbul." },
      ar: { title: "كومودينة في إسطنبول | Mobilyam Gelsin", description: "كومودينة بجانب السرير تُصنع في إسطنبول." },
    },
    yatak: {
      tr: { title: "Yatak Odası Takımı İstanbul | Mobilyam Gelsin", description: "Yatak ve yatak odası takımı, İstanbul’daki atölyemizde üretilir." },
      en: { title: "Beds in Istanbul | Mobilyam Gelsin", description: "Beds made for bedrooms in Istanbul." },
      ar: { title: "سرير في إسطنبول | Mobilyam Gelsin", description: "سرير لغرفة النوم يُصنع في إسطنبول." },
    },
    "makyaj-masasi": {
      tr: { title: "Makyaj Masası İstanbul | Mobilyam Gelsin", description: "Makyaj masası ve tuvalet masası, İstanbul’da yatak odanıza göre üretilir." },
      en: { title: "Vanity Tables in Istanbul | Mobilyam Gelsin", description: "Vanity tables made to measure in Istanbul." },
      ar: { title: "طاولة زينة في إسطنبول | Mobilyam Gelsin", description: "طاولة زينة لغرفة النوم في إسطنبول." },
    },
    sifonyer: {
      tr: { title: "Şifonyer İstanbul | Mobilyam Gelsin", description: "Şifonyer, İstanbul’da yatak odası için özel ölçüde üretilir." },
      en: { title: "Dressers in Istanbul | Mobilyam Gelsin", description: "Bedroom dressers made in Istanbul." },
      ar: { title: "تسريحة في إسطنبول | Mobilyam Gelsin", description: "تسريحة لغرفة النوم تُصنع في إسطنبول." },
    },
    ranza: {
      tr: { title: "Ranza İstanbul | Genç Odası | Mobilyam Gelsin", description: "Ranza, İstanbul’da genç odası için kişiye özel üretilir." },
      en: { title: "Bunk Beds in Istanbul | Mobilyam Gelsin", description: "Bunk beds for youth rooms, made in Istanbul." },
      ar: { title: "سرير بطابقين في إسطنبول | Mobilyam Gelsin", description: "سرير بطابقين لغرف الشباب في إسطنبول." },
    },
    "calisma-masasi": {
      tr: { title: "Çalışma Odası Mobilyası İstanbul | Mobilyam Gelsin", description: "Çalışma masası, İstanbul’daki mobilya atölyesinde üretilir." },
      en: { title: "Desks in Istanbul | Mobilyam Gelsin", description: "Study desks made in Istanbul." },
      ar: { title: "مكتب في إسطنبول | Mobilyam Gelsin", description: "مكتب لغرفة الدراسة يُصنع في إسطنبول." },
    },
    portmanto: {
      tr: { title: "Portmanto İstanbul | Antre | Mobilyam Gelsin", description: "Portmanto, İstanbul’da giriş holü ölçüsüne göre üretilir." },
      en: { title: "Hall Stands in Istanbul | Mobilyam Gelsin", description: "Entryway hall stands made to measure in Istanbul." },
      ar: { title: "وحدة مدخل في إسطنبول | Mobilyam Gelsin", description: "وحدة مدخل بمقاس البهو في إسطنبول." },
    },
  };
  return pages[slug] ?? null;
}
