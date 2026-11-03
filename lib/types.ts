export type Product = {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  nameAr: string;
  description: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  priceAmount: number;
  categorySlug: string;
  categoryLabel: string;
  tag: string;
  subtypeSlug: string | null;
  width: string;
  depth: string;
  height: string;
  images: string[];
  bestSeller: boolean;
  bestSellerOrder: number;
  createdAt: string;
};

export type OrderStatus = "active" | "completed";

export type Order = {
  id: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  product: string;
  price: string;
  priceAmount: number;
  orderDate: string;
  address: string;
  notes: string;
  completedAt: string | null;
  createdAt: string;
};

export type MeasurementStatus = "scheduled" | "done" | "cancelled";

export type Measurement = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  appointmentAt: string;
  notes: string;
  status: MeasurementStatus;
  createdAt: string;
  origin?: "manual" | "whatsapp";
  needsReview?: boolean;
  lockedFields?: string[];
  whatsappOwned?: string[];
};

export type L10n = { tr: string; en: string; ar: string };

export type ProductSubtype = {
  id: string;
  roomSlug: string;
  slug: string;
  label: L10n;
  displayOrder: number;
};

export type ColorOption = { color: string; name: L10n };

export type WeddingPackage = {
  id: string;
  slug: string;
  active: boolean;
  displayOrder: number;
  cardLine1: L10n;
  cardLine2: L10n;
  name: L10n;
  description: L10n;
  bedroomTitle: L10n;
  bedroomDescription: L10n;
  livingTitle: L10n;
  livingDescription: L10n;
  diningTitle: L10n;
  diningDescription: L10n;
  included: L10n[];
  tabletop: L10n;
  chairs: L10n;
  expert: L10n;
  fabrics: L10n[];
  woods: ColorOption[];
  sofaColors: ColorOption[];
  coverImage: string;
  images: { bed: string[]; sofa: string[]; dining: string[] };
  createdAt: string;
};

export type StoreData = {
  products: Product[];
  orders: Order[];
  measurements: Measurement[];
  packages?: WeddingPackage[];
  subtypes?: ProductSubtype[];
};

export const CATEGORIES = [
  { slug: "oturma-odasi", label: "Salon / Oturma Odası" },
  { slug: "yemek-odasi", label: "Yemek Odası" },
  { slug: "yatak-odasi", label: "Yatak Odası" },
  { slug: "genc-odasi", label: "Genç Odası" },
  { slug: "ofis", label: "Çalışma Odası" },
  { slug: "portmanto", label: "Antre / Portmanto" },
] as const;

export const CATEGORY_COPY: Record<(typeof CATEGORIES)[number]["slug"], { TR: string; EN: string; AR: string }> = {
  "oturma-odasi": { TR: "Salon / Oturma Odası", EN: "Living Room", AR: "غرفة المعيشة" },
  "yemek-odasi": { TR: "Yemek Odası", EN: "Dining Room", AR: "غرفة الطعام" },
  "yatak-odasi": { TR: "Yatak Odası", EN: "Bedroom", AR: "غرفة النوم" },
  "genc-odasi": { TR: "Genç Odası", EN: "Youth Room", AR: "غرفة الشباب" },
  ofis: { TR: "Çalışma Odası", EN: "Study Room", AR: "غرفة المكتب" },
  portmanto: { TR: "Antre / Portmanto", EN: "Entryway", AR: "المدخل" },
};

export const TAG_COPY: Record<string, { TR: string; EN: string; AR: string }> = {
  Gardırop: { TR: "Gardırop", EN: "Wardrobe", AR: "خزانة ملابس" },
  Ranza: { TR: "Ranza", EN: "Bunk Bed", AR: "سرير بطابقين" },
  Yatak: { TR: "Yatak", EN: "Bed", AR: "سرير" },
  Komodin: { TR: "Komodin", EN: "Nightstand", AR: "كومودينة" },
  Şifonir: { TR: "Şifonir", EN: "Dresser", AR: "تسريحة" },
  "Makyaj Masası": { TR: "Makyaj Masası", EN: "Vanity Table", AR: "طاولة زينة" },
  Masalar: { TR: "Masalar", EN: "Tables", AR: "طاولات" },
  Portmanto: { TR: "Portmanto", EN: "Hall Stand", AR: "وحدة المدخل" },
};
