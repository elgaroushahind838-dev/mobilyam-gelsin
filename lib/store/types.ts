import type { Measurement, Order, Product, ProductSubtype, WeddingPackage } from "../types";

export type OrderInput = Omit<Order, "id" | "createdAt" | "completedAt" | "status" | "address" | "notes"> & {
  status?: Order["status"];
  address?: string;
  notes?: string;
};

export type MeasurementInput = Omit<Measurement, "id" | "createdAt" | "status"> & {
  status?: Measurement["status"];
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "slug"> & { slug?: string };

export interface Store {
  listProducts(): Promise<Product[]>;
  getProduct(idOrSlug: string): Promise<Product | null>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(id: string, input: ProductInput): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  listOrders(): Promise<Order[]>;
  createOrder(input: OrderInput): Promise<Order>;
  updateOrder(id: string, input: Partial<OrderInput> & { status?: Order["status"] }): Promise<Order | null>;
  completeOrder(id: string): Promise<Order | null>;
  deleteOrder(id: string): Promise<boolean>;
  listSubtypes(roomSlug?: string): Promise<ProductSubtype[]>;
  createSubtype(input: Omit<ProductSubtype, "id">): Promise<ProductSubtype>;
  updateSubtype(id: string, input: Omit<ProductSubtype, "id">): Promise<ProductSubtype | null>;
  deleteSubtype(id: string): Promise<boolean>;
  listPackages(): Promise<WeddingPackage[]>;
  getPackage(idOrSlug: string): Promise<WeddingPackage | null>;
  createPackage(input: Omit<WeddingPackage, "id" | "createdAt">): Promise<WeddingPackage>;
  updatePackage(id: string, input: Omit<WeddingPackage, "id" | "createdAt">): Promise<WeddingPackage | null>;
  deletePackage(id: string): Promise<boolean>;
  listMeasurements(): Promise<Measurement[]>;
  createMeasurement(input: MeasurementInput): Promise<Measurement>;
  updateMeasurement(id: string, input: MeasurementInput): Promise<Measurement | null>;
  deleteMeasurement(id: string): Promise<boolean>;
}
