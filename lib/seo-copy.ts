import { CATEGORY_COPY } from "./types";
import { SEED_PRODUCTS } from "./seed-products";

export const SITE_URL = "https://mobilyam-gelsin.com";
export type SeoLang = "tr" | "en" | "ar";

export const NAP = {
  name: "Mobilyam Gelsin",
  phoneDisplay: "+90 551 483 53 22",
  phoneE164: "+905514835322",
  email: "info@mobilyam-gelsin.com",
  streetAddress: "385. Sokak, Yunus Emre Mahallesi",
  postalCode: "34510",
  locality: "İstanbul",
  district: "Esenyurt",
};

export function seoLang(value: string | null | undefined): SeoLang {
  const lang = value?.toLowerCase();
  if (lang === "en" || lang === "ar" || lang === "tr") return lang;
  return "tr";
}

export function uiLang(lang: SeoLang): "TR" | "EN" | "AR" {
  if (lang === "en") return "EN";
  if (lang === "ar") return "AR";
  return "TR";
}

export function absoluteUrl(pathname: string, lang: SeoLang): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const url = new URL(path, SITE_URL);
  url.search = "";
  if (lang !== "tr") url.searchParams.set("lang", lang);
  return url.toString();
}

type Copy = Record<SeoLang, { title: string; description: string }>;

const HOME: Copy = {
  tr: {
    title: "Gömme Dolap ve Özel Tasarım Mobilya İstanbul | Mobilyam Gelsin",
    description:
      "İstanbul’da gömme gardırop, sürgülü dolap ve kişiye özel mobilya. Mobilyam Gelsin, Esenyurt’taki mobilya atölyesinde yaşam alanınıza göre üretim yapar.",
  },
  en: {
    title: "Fitted Wardrobes and Custom Furniture in Istanbul | Mobilyam Gelsin",
    description:
      "Fitted wardrobes, sliding-door closets, and made-to-measure furniture in Istanbul. Mobilyam Gelsin builds them in its Esenyurt workshop.",
  },
  ar: {
    title: "خزائن مدمجة وأثاث حسب المقاس في إسطنبول | Mobilyam Gelsin",
    description:
      "خزائن ملابس مدمجة وأبواب منزلقة وأثاث بمقاس المساحة في إسطنبول. موبيليام غيلسين تصنّعها في ورشتها بإسنيورت.",
  },
};

const CATEGORY: Record<string, Copy> = {
  "yatak-odasi": {
    tr: {
      title: "Gardırop Modelleri ve Yatak Odası Takımı İstanbul | Mobilyam Gelsin",
      description:
        "İstanbul’da gardırop modelleri, gömme dolap, başucu komodin ve makyaj masası. Yatak odası takımını atölyemizde ölçüye göre üretiyoruz.",
    },
    en: {
      title: "Bedroom Sets and Wardrobe Models in Istanbul | Mobilyam Gelsin",
      description:
        "Wardrobes, fitted closets, bedside tables, and vanity tables made to measure in Istanbul.",
    },
    ar: {
      title: "أطقم غرف نوم وخزائن في إسطنبول | Mobilyam Gelsin",
      description: "خزائن ملابس وخزائن مدمجة وكومودينة وطاولة زينة بمقاس غرفتك في إسطنبول.",
    },
  },
  "genc-odasi": {
    tr: {
      title: "Ranza ve Genç Odası Mobilyası İstanbul | Mobilyam Gelsin",
      description: "İstanbul’da genç odası için ranza ve kişiye özel mobilya. Ölçüye göre atölyemizde üretilir.",
    },
    en: {
      title: "Bunk Beds and Youth Room Furniture in Istanbul | Mobilyam Gelsin",
      description: "Bunk beds and made-to-measure furniture for youth rooms, built in Istanbul.",
    },
    ar: {
      title: "سرير بطابقين وأثاث غرف شباب في إسطنبول | Mobilyam Gelsin",
      description: "أسرّة بطابقين وأثاث بمقاس غرفة الشباب، يُصنع في إسطنبول.",
    },
  },
  "oturma-odasi": {
    tr: {
      title: "Özel Tasarım Oturma Odası Mobilyası İstanbul | Mobilyam Gelsin",
      description: "İstanbul’da oturma odası için özel tasarım mobilya. Koltuk ve yaşam alanı ölçülerinize göre üretilir.",
    },
    en: {
      title: "Custom Living Room Furniture in Istanbul | Mobilyam Gelsin",
      description: "Living room furniture designed for your space and made in our Istanbul workshop.",
    },
    ar: {
      title: "أثاث غرفة معيشة حسب التصميم في إسطنبول | Mobilyam Gelsin",
      description: "أثاث غرفة جلوس بتصميم خاص، يُصنع في ورشتنا في إسطنبول.",
    },
  },
  "yemek-odasi": {
    tr: {
      title: "Yemek Odası Mobilyası İstanbul | Mobilyam Gelsin",
      description: "İstanbul’da yemek odası mobilyası. Masa ve oturma grubunu atölyemizde yaşam alanınıza göre hazırlıyoruz.",
    },
    en: {
      title: "Dining Room Furniture in Istanbul | Mobilyam Gelsin",
      description: "Dining furniture made to the size of your room in our Istanbul workshop.",
    },
    ar: {
      title: "أثاث غرفة طعام في إسطنبول | Mobilyam Gelsin",
      description: "أثاث غرفة الطعام يُصنع في إسطنبول وفق مقاس المساحة.",
    },
  },
  ofis: {
    tr: {
      title: "Çalışma Odası Mobilyası İstanbul | Mobilyam Gelsin",
      description: "İstanbul’da çalışma odası mobilyası ve çalışma masası. Kişiye özel ölçüyle atölyemizde üretilir.",
    },
    en: {
      title: "Study Room Furniture in Istanbul | Mobilyam Gelsin",
      description: "Desks and study furniture made to measure in Istanbul.",
    },
    ar: {
      title: "أثاث غرفة المكتب في إسطنبول | Mobilyam Gelsin",
      description: "مكاتب وأثاث غرفة الدراسة بمقاس المكان، من ورشتنا في إسطنبول.",
    },
  },
  portmanto: {
    tr: {
      title: "Portmanto İstanbul | Özel Ölçü Mobilya | Mobilyam Gelsin",
      description: "İstanbul’da giriş holü için portmanto. Özel ölçü mobilya olarak atölyemizde üretilir.",
    },
    en: {
      title: "Hall Stands in Istanbul | Made-to-Measure | Mobilyam Gelsin",
      description: "Entryway hall stands built to your measurements in Istanbul.",
    },
    ar: {
      title: "وحدات مدخل في إسطنبول | Mobilyam Gelsin",
      description: "وحدات مدخل بمقاس البهو، تُصنع في إسطنبول.",
    },
  },
};

const PACKAGES: Record<string, Copy> = {
  ekonomik: {
    tr: {
      title: "Ekonomik Düğün Paketi Mobilya İstanbul | Mobilyam Gelsin",
      description: "İstanbul’da ekonomik çeyiz ve düğün paketi: yatak odası takımı, oturma grubu ve yemek odası. Atölyemizde üretilir.",
    },
    en: {
      title: "Economic Wedding Furniture Package in Istanbul | Mobilyam Gelsin",
      description: "A wedding furniture package with bedroom, living, and dining pieces, made in Istanbul.",
    },
    ar: {
      title: "باقة أثاث زفاف اقتصادية في إسطنبول | Mobilyam Gelsin",
      description: "باقة زفاف تشمل غرفة النوم والجلوس والطعام، تُصنع في إسطنبول.",
    },
  },
  standart: {
    tr: {
      title: "Standart Çeyiz Paketi Mobilya İstanbul | Mobilyam Gelsin",
      description: "İstanbul’da standart düğün paketi mobilyası. Yatak odası, oturma ve yemek odasını birlikte hazırlıyoruz.",
    },
    en: {
      title: "Standard Wedding Furniture Package in Istanbul | Mobilyam Gelsin",
      description: "A standard bridal furniture package made in our Istanbul workshop.",
    },
    ar: {
      title: "باقة أثاث زفاف قياسية في إسطنبول | Mobilyam Gelsin",
      description: "باقة أثاث زفاف قياسية من ورشة إسطنبول.",
    },
  },
  premium: {
    tr: {
      title: "Premium Düğün Paketi Mobilya İstanbul | Mobilyam Gelsin",
      description: "İstanbul’da premium çeyiz paketi. Özel tasarım yatak odası, oturma grubu ve yemek odası atölyemizde üretilir.",
    },
    en: {
      title: "Premium Wedding Furniture Package in Istanbul | Mobilyam Gelsin",
      description: "A premium custom wedding package, produced in Istanbul.",
    },
    ar: {
      title: "باقة أثاث زفاف مميزة في إسطنبول | Mobilyam Gelsin",
      description: "باقة زفاف بتصميم خاص، تُنتج في إسطنبول.",
    },
  },
};

const CATEGORY_INTRO: Record<string, Record<SeoLang, string>> = {
  "yatak-odasi": {
    tr: "Yatak odası takımı, gardırop modelleri, başucu komodin ve makyaj masasını İstanbul’daki atölyemizde ölçüye göre üretiyoruz.",
    en: "Bedroom sets, wardrobes, bedside tables, and vanity tables are made to measure in our Istanbul workshop.",
    ar: "نصنع أطقم غرف النوم والخزائن والكومودينة وطاولة الزينة في إسطنبول وفق المقاس.",
  },
  "genc-odasi": {
    tr: "Genç odası için ranza ve kişiye özel mobilyayı İstanbul’da, odanın ölçüsüne göre hazırlıyoruz.",
    en: "Bunk beds and made-to-measure pieces for youth rooms, built in Istanbul.",
    ar: "أسرّة بطابقين وأثاث بمقاس غرفة الشباب، من ورشتنا في إسطنبول.",
  },
  "oturma-odasi": {
    tr: "Oturma odası için özel tasarım mobilyayı İstanbul’daki mobilya atölyemizde üretiyoruz.",
    en: "Custom living room furniture, made in our Istanbul workshop.",
    ar: "أثاث غرفة معيشة بتصميم خاص، يُصنع في ورشتنا في إسطنبول.",
  },
  "yemek-odasi": {
    tr: "Yemek odası mobilyasını İstanbul’da, mekânınızın ölçüsüne göre imal ediyoruz.",
    en: "Dining furniture manufactured in Istanbul to the size of your room.",
    ar: "أثاث غرفة الطعام يُصنع في إسطنبول وفق مقاس المكان.",
  },
  ofis: {
    tr: "Çalışma odası mobilyasını İstanbul’da, masanızın duracağı ölçüye göre üretiyoruz.",
    en: "Study furniture in Istanbul, built to the space where the desk will stand.",
    ar: "أثاث غرفة المكتب في إسطنبول، بمقاس المكان الذي يوضع فيه المكتب.",
  },
  portmanto: {
    tr: "Portmantoyu İstanbul’da, giriş holünüzün ölçüsüne göre üretiyoruz.",
    en: "Hall stands in Istanbul, made to the size of your entryway.",
    ar: "وحدات المدخل في إسطنبول، بمقاس بهو الدخول.",
  },
};

export function categoryIntro(slug: string, lang: SeoLang): string {
  return CATEGORY_INTRO[slug]?.[lang] ?? "";
}

function productFocus(slug: string, categorySlug: string): Record<SeoLang, { titleBit: string; tail: string }> {
  if (slug.includes("surgulu")) {
    return {
      tr: { titleBit: "Sürgülü Dolap İstanbul", tail: "Sürgülü gardırop, İstanbul’daki atölyemizde ölçüye göre üretilir." },
      en: { titleBit: "Sliding Wardrobe in Istanbul", tail: "A sliding-door wardrobe made to measure in Istanbul." },
      ar: { titleBit: "خزانة منزلقة في إسطنبول", tail: "خزانة بأبواب منزلقة تُصنع حسب المقاس في إسطنبول." },
    };
  }
  if (slug.includes("ranza") || categorySlug === "genc-odasi") {
    return {
      tr: { titleBit: "Ranza İstanbul", tail: "Genç odası için ranza, İstanbul’da kişiye özel üretilir." },
      en: { titleBit: "Bunk Bed in Istanbul", tail: "A bunk bed for a youth room, made to order in Istanbul." },
      ar: { titleBit: "سرير بطابقين في إسطنبول", tail: "سرير بطابقين لغرفة الشباب، يُصنع حسب الطلب في إسطنبول." },
    };
  }
  if (slug.includes("komodin") || slug.includes("sifonyer")) {
    return {
      tr: { titleBit: "Komodin İstanbul", tail: "Başucu ve komodin, yatak odası için İstanbul’daki atölyemizde üretilir." },
      en: { titleBit: "Nightstand in Istanbul", tail: "A bedside table made for the bedroom in Istanbul." },
      ar: { titleBit: "كومودينة في إسطنبول", tail: "كومودينة بجانب السرير، تُصنع في إسطنبول." },
    };
  }
  if (slug.includes("makyaj")) {
    return {
      tr: { titleBit: "Makyaj Masası İstanbul", tail: "Makyaj masası, İstanbul’da yatak odanıza göre üretilir." },
      en: { titleBit: "Vanity Table in Istanbul", tail: "A vanity table made for your bedroom in Istanbul." },
      ar: { titleBit: "طاولة زينة في إسطنبول", tail: "طاولة زينة لغرفة النوم، تُصنع في إسطنبول." },
    };
  }
  if (categorySlug === "portmanto" || slug.includes("portmanto")) {
    return {
      tr: { titleBit: "Portmanto İstanbul", tail: "Giriş için portmanto, İstanbul’da özel ölçüyle üretilir." },
      en: { titleBit: "Hall Stand in Istanbul", tail: "An entryway hall stand made to measure in Istanbul." },
      ar: { titleBit: "وحدة مدخل في إسطنبول", tail: "وحدة مدخل بمقاس البهو، من إسطنبول." },
    };
  }
  if (categorySlug === "ofis") {
    return {
      tr: { titleBit: "Çalışma Odası Mobilyası İstanbul", tail: "Çalışma masası, İstanbul’daki atölyemizde üretilir." },
      en: { titleBit: "Study Furniture in Istanbul", tail: "A desk made in our Istanbul workshop." },
      ar: { titleBit: "أثاث مكتب في إسطنبول", tail: "مكتب يُصنع في ورشتنا في إسطنبول." },
    };
  }
  if (slug.includes("yatak") && !slug.includes("dolap")) {
    return {
      tr: { titleBit: "Yatak Odası Takımı İstanbul", tail: "Yatak odası için parça, İstanbul’daki atölyemizde üretilir." },
      en: { titleBit: "Bedroom Furniture in Istanbul", tail: "A bedroom piece made in our Istanbul workshop." },
      ar: { titleBit: "أثاث غرفة نوم في إسطنبول", tail: "قطعة لغرفة النوم، تُصنع في إسطنبول." },
    };
  }
  if (categorySlug === "yatak-odasi") {
    return {
      tr: { titleBit: "Gömme Gardırop İstanbul", tail: "Gömme dolap ve gardırop, İstanbul’da yatak odanıza göre üretilir." },
      en: { titleBit: "Fitted Wardrobe in Istanbul", tail: "A fitted wardrobe made for your bedroom in Istanbul." },
      ar: { titleBit: "خزانة مدمجة في إسطنبول", tail: "خزانة ملابس مدمجة لغرفة النوم، تُصنع في إسطنبول." },
    };
  }
  return {
    tr: { titleBit: "Özel Tasarım Mobilya İstanbul", tail: "Kişiye özel mobilya, İstanbul’daki atölyemizde üretilir." },
    en: { titleBit: "Custom Furniture in Istanbul", tail: "Made-to-measure furniture from our Istanbul workshop." },
    ar: { titleBit: "أثاث حسب التصميم في إسطنبول", tail: "أثاث بمقاس المكان، من ورشة إسطنبول." },
  };
}

function knownProduct(slug: string) {
  return SEED_PRODUCTS.find((item) => item.slug === slug);
}

export function pageCopy(pathname: string, lang: SeoLang, productName?: string, productDescription?: string): { title: string; description: string } {
  if (pathname === "/" || pathname === "") return HOME[lang];
  const category = pathname.match(/^\/kategori\/([^/]+)\/?$/);
  if (category && CATEGORY[category[1]]) return CATEGORY[category[1]][lang];
  const pack = pathname.match(/^\/paket\/([^/]+)\/?$/);
  if (pack && PACKAGES[pack[1]]) return PACKAGES[pack[1]][lang];
  const product = pathname.match(/^\/urun\/([^/]+)\/?$/);
  if (product) {
    const item = knownProduct(product[1]);
    const name = productName || item?.name || "Mobilyam Gelsin";
    const focus = productFocus(product[1], item?.categorySlug || "");
    const description = productDescription || item?.description || focus[lang].tail;
    const bit = focus[lang].titleBit;
    const lead = bit.split(" ")[0]?.toLocaleLowerCase("tr") ?? "";
    const title = lead && name.toLocaleLowerCase("tr").includes(lead)
      ? `${name} İstanbul | Mobilyam Gelsin`
      : `${name} | ${bit} | Mobilyam Gelsin`;
    return {
      title,
      description: `${description} ${focus[lang].tail}`,
    };
  }
  return HOME[lang];
}

export function categoryName(slug: string, lang: SeoLang): string {
  const copy = CATEGORY_COPY[slug as keyof typeof CATEGORY_COPY];
  if (!copy) return slug;
  return copy[uiLang(lang)];
}
