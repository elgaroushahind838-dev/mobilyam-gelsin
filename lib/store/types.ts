import type { Measurement, Order, Product } from "../types";

export type OrderInput = Omit<Order, "id" | "createdAt" | "completedAt" | "status"> & {
  status?: Order["status"];
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
  listMeasurements(): Promise<Measurement[]>;
  createMeasurement(input: MeasurementInput): Promise<Measurement>;
  updateMeasurement(id: string, input: MeasurementInput): Promise<Measurement | null>;
  deleteMeasurement(id: string): Promise<boolean>;
}
