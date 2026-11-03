import type { L10n, WeddingPackage } from "./types";

const text = (tr: string, en: string, ar: string): L10n => ({ tr, en, ar });

const shared = {
  description: text(
    "Dinginliği yansıtan, fonksiyonel ve zarif parçalar.",
    "Functional, elegant pieces that reflect a sense of calm.",
    "قطع عملية وأنيقة تعكس الهدوء.",
  ),
  bedroomTitle: text("Yatak Odası Takımı", "Bedroom Set", "طقم غرفة النوم"),
  bedroomDescription: text(
    "Dinginliği yansıtan, fonksiyonel ve zarif parçalar.",
    "Functional, elegant pieces that reflect a sense of calm.",
    "قطع عملية وأنيقة تعكس الهدوء.",
  ),
  livingTitle: text("Oturma Grubu", "Living Room Group", "طقم الجلوس"),
  livingDescription: text(
    "Konforun en yalın hali, fırınlanmış iskelet yapısı.",
    "Comfort in its simplest form, with a kiln-dried frame.",
    "الراحة في أبسط صورها، بهيكل خشب مجفف في الفرن.",
  ),
  diningTitle: text("Yemek Odası", "Dining Room", "غرفة الطعام"),
  diningDescription: text(
    "Mermer ve masif meşenin kusursuz uyumu.",
    "The perfect match of marble and solid oak.",
    "التناغم المثالي بين الرخام والبلوط الصلب.",
  ),
  included: [
    text("Karyola (160x200)", "Bed Frame (160x200)", "هيكل سرير (160x200)"),
    text("2 Adet Komodin", "2 nightstands", "كومودينتان"),
    text("6 Kapılı Dolap", "6-door wardrobe", "خزانة بستة أبواب"),
  ],
  tabletop: text("Carrara Mermer veya Doğal Meşe", "Carrara Marble or Natural Oak", "رخام كرارا أو بلوط طبيعي"),
  chairs: text("6 veya 8 Kişilik Seçenekler", "6 or 8 Person Options", "خيارات لـ 6 أو 8 أشخاص"),
  expert: text(
    "İç mimarlarımız konfigürasyon yapabilir.",
    "Our interior architects can set up the configuration.",
    "يمكن لمصممينا الداخليين إعداد هذا التكوين.",
  ),
  fabrics: [
    text("BUKLET", "BOUCLE", "بوكليت"),
    text("KETEN", "LINEN", "كتان"),
    text("KADİFE", "VELVET", "مخمل"),
  ],
  woods: [
    { color: "#4a3728", name: text("Koyu Ceviz", "Dark Walnut", "جوز داكن") },
    { color: "#8c7f73", name: text("Açık Meşe", "Light Oak", "بلوط فاتح") },
    { color: "#d2b48c", name: text("Doğal Ahşap", "Natural Wood", "خشب طبيعي") },
  ],
  sofaColors: [
    { color: "#eacbd2", name: text("Gül Kurusu", "Dusty Rose", "وردي ترابي") },
    { color: "#dcdde1", name: text("Açık Gri", "Light Gray", "رمادي فاتح") },
    { color: "#8ba1b5", name: text("Buz Mavisi", "Ice Blue", "أزرق ثلجي") },
    { color: "#2d4a5a", name: text("Lacivert", "Navy", "كحلي") },
    { color: "#fdf3d0", name: text("Krem", "Cream", "كريمي") },
    { color: "#849021", name: text("Hardal", "Mustard", "خردلي") },
    { color: "#556b2f", name: text("Ada Çayı", "Sage", "أخضر مريمية") },
    { color: "#1f3b2a", name: text("Zümrüt Yeşil", "Emerald", "أخضر زمردي") },
  ],
};

function pack(
  partial: Pick<WeddingPackage, "id" | "slug" | "displayOrder" | "cardLine1" | "cardLine2" | "name" | "coverImage" | "images">,
): WeddingPackage {
  return {
    active: true,
    description: shared.description,
    bedroomTitle: shared.bedroomTitle,
    bedroomDescription: shared.bedroomDescription,
    livingTitle: shared.livingTitle,
    livingDescription: shared.livingDescription,
    diningTitle: shared.diningTitle,
    diningDescription: shared.diningDescription,
    included: shared.included,
    tabletop: shared.tabletop,
    chairs: shared.chairs,
    expert: shared.expert,
    fabrics: shared.fabrics,
    woods: shared.woods,
    sofaColors: shared.sofaColors,
    createdAt: "2024-05-01T09:00:00.000Z",
    ...partial,
  };
}

export const SEED_PACKAGES: WeddingPackage[] = [
  pack({
    id: "pkg-ekonomik",
    slug: "ekonomik",
    displayOrder: 0,
    cardLine1: text("Ekonomik", "Economy", "الباقة"),
    cardLine2: text("Paket", "Package", "الاقتصادية"),
    name: text("Ekonomik Düğün Paketi", "Economy Wedding Package", "باقة الزفاف الاقتصادية"),
    coverImage: "/images/oturma-odasi.jpg",
    images: {
      bed: ["/images/kutu.jpeg", "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?q=80&w=800&auto=format&fit=crop"],
      sofa: ["https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop"],
      dining: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop"],
    },
  }),
  pack({
    id: "pkg-premium",
    slug: "premium",
    displayOrder: 1,
    cardLine1: text("Premium", "Premium", "الباقة"),
    cardLine2: text("Paket", "Package", "المميزة"),
    name: text("Premium Düğün Paketi", "Premium Wedding Package", "باقة الزفاف البريميوم"),
    coverImage: "/images/yatak-odasi.jpg",
    images: {
      bed: ["https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop"],
      sofa: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop"],
      dining: ["https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=800&auto=format&fit=crop"],
    },
  }),
  pack({
    id: "pkg-standart",
    slug: "standart",
    displayOrder: 2,
    cardLine1: text("Standart", "Standard", "الباقة"),
    cardLine2: text("Paket", "Package", "القياسية"),
    name: text("Standart Düğün Paketi", "Standard Wedding Package", "باقة الزفاف القياسية"),
    coverImage: "/images/yemek-odasi.jpg",
    images: {
      bed: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?q=80&w=800&auto=format&fit=crop"],
      sofa: ["https://images.unsplash.com/photo-1540574163026-643ea20d25b5?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop"],
      dining: ["https://images.unsplash.com/photo-1604578762246-41134e37f9cc?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1617806118233-18e1c094f094?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop"],
    },
  }),
];

export function emptyPackageContent(): Omit<WeddingPackage, "id" | "createdAt"> {
  const blank = text("", "", "");
  return {
    slug: "",
    active: true,
    displayOrder: 0,
    cardLine1: text("Yeni", "New", "جديد"),
    cardLine2: text("Paket", "Package", "باقة"),
    name: text("Yeni Düğün Paketi", "New Wedding Package", "باقة زفاف جديدة"),
    description: shared.description,
    bedroomTitle: shared.bedroomTitle,
    bedroomDescription: shared.bedroomDescription,
    livingTitle: shared.livingTitle,
    livingDescription: shared.livingDescription,
    diningTitle: shared.diningTitle,
    diningDescription: shared.diningDescription,
    included: [blank],
    tabletop: shared.tabletop,
    chairs: shared.chairs,
    expert: shared.expert,
    fabrics: shared.fabrics,
    woods: shared.woods,
    sofaColors: shared.sofaColors,
    coverImage: "/images/oturma-odasi.jpg",
    images: { bed: [], sofa: [], dining: [] },
  };
}
