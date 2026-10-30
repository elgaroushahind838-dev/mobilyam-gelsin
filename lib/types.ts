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
  width: string;
  depth: string;
  height: string;
  images: string[];
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
  completedAt: string | null;
  createdAt: string;
};

export type Measurement = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  appointmentAt: string;
  notes: string;
  createdAt: string;
};

export type StoreData = {
  products: Product[];
  orders: Order[];
  measurements: Measurement[];
};

export const CATEGORIES = [
  { slug: "oturma-odasi", label: "Oturma Odası" },
  { slug: "yemek-odasi", label: "Yemek Odası" },
  { slug: "yatak-odasi", label: "Yatak Odası" },
  { slug: "genc-odasi", label: "Genç Odası" },
  { slug: "ofis", label: "Çalışma Odası" },
  { slug: "portmanto", label: "Portmanto" },
] as const;
