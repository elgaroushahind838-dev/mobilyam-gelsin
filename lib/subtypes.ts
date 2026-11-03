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
      en: { title: "Wardrobes and Fitted Closets in Istanbul | Mobilyam Gelsin", description: "Wardrobe models and fitted closets in Istanbul, made in our workshop for your bedroom." },
      ar: { title: "خزائن ملابس مدمجة في إسطنبول | Mobilyam Gelsin", description: "موديلات خزائن وخزائن مدمجة في إسطنبول، تُصنع في ورشتنا لغرفة نومك." },
    },
    komodin: {
      tr: { title: "Komodin ve Başucu İstanbul | Mobilyam Gelsin", description: "Yatak odası için komodin ve başucu, İstanbul’da özel ölçüyle üretilir." },
      en: { title: "Nightstands in Istanbul | Mobilyam Gelsin", description: "Nightstands and bedside tables for the bedroom, made to measure in Istanbul." },
      ar: { title: "كومودينة في إسطنبول | Mobilyam Gelsin", description: "كومودينة وطاولة بجانب السرير لغرفة النوم، تُصنع في إسطنبول حسب المقاس." },
    },
    yatak: {
      tr: { title: "Yatak Odası Takımı İstanbul | Mobilyam Gelsin", description: "Yatak ve yatak odası takımı, İstanbul’daki atölyemizde üretilir." },
      en: { title: "Beds in Istanbul | Mobilyam Gelsin", description: "Beds and bedroom sets, made in our workshop in Istanbul." },
      ar: { title: "سرير في إسطنبول | Mobilyam Gelsin", description: "سرير وطقم غرفة نوم، يُصنع في ورشتنا في إسطنبول." },
    },
    "makyaj-masasi": {
      tr: { title: "Makyaj Masası İstanbul | Mobilyam Gelsin", description: "Makyaj masası ve tuvalet masası, İstanbul’da yatak odanıza göre üretilir." },
      en: { title: "Vanity Tables in Istanbul | Mobilyam Gelsin", description: "Vanity and dressing tables, made for your bedroom in Istanbul." },
      ar: { title: "طاولة زينة في إسطنبول | Mobilyam Gelsin", description: "طاولة زينة وطاولة تزيين، تُصنع في إسطنبول لغرفة نومك." },
    },
    sifonyer: {
      tr: { title: "Şifonyer İstanbul | Mobilyam Gelsin", description: "Şifonyer, İstanbul’da yatak odası için özel ölçüde üretilir." },
      en: { title: "Dressers in Istanbul | Mobilyam Gelsin", description: "A dresser for the bedroom, made to measure in Istanbul." },
      ar: { title: "تسريحة في إسطنبول | Mobilyam Gelsin", description: "تسريحة لغرفة النوم، تُصنع في إسطنبول حسب المقاس." },
    },
    ranza: {
      tr: { title: "Ranza İstanbul | Genç Odası | Mobilyam Gelsin", description: "Ranza, İstanbul’da genç odası için kişiye özel üretilir." },
      en: { title: "Bunk Beds in Istanbul | Mobilyam Gelsin", description: "A bunk bed for a youth room, made to order in Istanbul." },
      ar: { title: "سرير بطابقين في إسطنبول | Mobilyam Gelsin", description: "سرير بطابقين لغرفة الشباب، يُصنع حسب الطلب في إسطنبول." },
    },
    "calisma-masasi": {
      tr: { title: "Çalışma Odası Mobilyası İstanbul | Mobilyam Gelsin", description: "Çalışma masası, İstanbul’daki mobilya atölyesinde üretilir." },
      en: { title: "Desks in Istanbul | Mobilyam Gelsin", description: "A desk, made in our furniture workshop in Istanbul." },
      ar: { title: "مكتب في إسطنبول | Mobilyam Gelsin", description: "مكتب يُصنع في ورشة الأثاث في إسطنبول." },
    },
    portmanto: {
      tr: { title: "Portmanto İstanbul | Antre | Mobilyam Gelsin", description: "Portmanto, İstanbul’da giriş holü ölçüsüne göre üretilir." },
      en: { title: "Hall Stands in Istanbul | Mobilyam Gelsin", description: "A hall stand, made to the size of your entryway in Istanbul." },
      ar: { title: "وحدة مدخل في إسطنبول | Mobilyam Gelsin", description: "وحدة مدخل تُصنع في إسطنبول بمقاس بهو الدخول." },
    },
  };
  return pages[slug] ?? null;
}
