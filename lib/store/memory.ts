import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { slugify } from "../format";
import { SEED_PRODUCTS } from "../seed-products";
import type { Measurement, Order, Product, StoreData } from "../types";
import type { MeasurementInput, OrderInput, ProductInput, Store } from "./types";

const filePath = path.join(process.cwd(), "data", "local-store.json");
let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

async function readData(): Promise<StoreData> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      products: parsed.products ?? [],
      orders: parsed.orders ?? [],
      measurements: parsed.measurements ?? [],
    };
  } catch {
    const seeded: StoreData = { products: SEED_PRODUCTS, orders: [], measurements: [] };
    await writeData(seeded);
    return seeded;
  }
}

async function writeData(data: StoreData) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

function uniqueSlug(products: Product[], base: string, currentId?: string) {
  let slug = base;
  let n = 2;
  while (products.some((item) => item.slug === slug && item.id !== currentId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function createFileStore(): Store {
  return {
    async listProducts() {
      const data = await readData();
      return [...data.products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async getProduct(idOrSlug) {
      const data = await readData();
      return data.products.find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
    },
    async createProduct(input: ProductInput) {
      return withLock(async () => {
        const data = await readData();
        const product: Product = {
          ...input,
          id: crypto.randomUUID(),
          slug: uniqueSlug(data.products, input.slug || slugify(input.name)),
          images: input.images.filter(Boolean),
          createdAt: new Date().toISOString(),
        };
        data.products.push(product);
        await writeData(data);
        return product;
      });
    },
    async updateProduct(id, input) {
      return withLock(async () => {
        const data = await readData();
        const index = data.products.findIndex((item) => item.id === id);
        if (index < 0) return null;
        const current = data.products[index];
        const next: Product = {
          ...current,
          ...input,
          id: current.id,
          slug: uniqueSlug(data.products, input.slug || current.slug, current.id),
          images: input.images.filter(Boolean),
          createdAt: current.createdAt,
        };
        data.products[index] = next;
        await writeData(data);
        return next;
      });
    },
    async deleteProduct(id) {
      return withLock(async () => {
        const data = await readData();
        const before = data.products.length;
        data.products = data.products.filter((item) => item.id !== id);
        await writeData(data);
        return data.products.length < before;
      });
    },
    async listOrders() {
      const data = await readData();
      return [...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async createOrder(input: OrderInput) {
      return withLock(async () => {
        const data = await readData();
        const order: Order = {
          id: crypto.randomUUID(),
          status: input.status ?? "active",
          customerName: input.customerName,
          phone: input.phone,
          product: input.product,
          price: input.price,
          priceAmount: input.priceAmount,
          orderDate: input.orderDate,
          completedAt: input.status === "completed" ? new Date().toISOString() : null,
          createdAt: new Date().toISOString(),
        };
        data.orders.push(order);
        await writeData(data);
        return order;
      });
    },
    async updateOrder(id, input) {
      return withLock(async () => {
        const data = await readData();
        const index = data.orders.findIndex((item) => item.id === id);
        if (index < 0) return null;
        const current = data.orders[index];
        const next: Order = { ...current, ...input, id: current.id, createdAt: current.createdAt };
        data.orders[index] = next;
        await writeData(data);
        return next;
      });
    },
    async completeOrder(id) {
      return withLock(async () => {
        const data = await readData();
        const index = data.orders.findIndex((item) => item.id === id);
        if (index < 0) return null;
        data.orders[index] = { ...data.orders[index], status: "completed", completedAt: new Date().toISOString() };
        await writeData(data);
        return data.orders[index];
      });
    },
    async deleteOrder(id) {
      return withLock(async () => {
        const data = await readData();
        const before = data.orders.length;
        data.orders = data.orders.filter((item) => item.id !== id);
        await writeData(data);
        return data.orders.length < before;
      });
    },
    async listMeasurements() {
      const data = await readData();
      return [...data.measurements].sort((a, b) => a.appointmentAt.localeCompare(b.appointmentAt));
    },
    async createMeasurement(input: MeasurementInput) {
      return withLock(async () => {
        const data = await readData();
        const item: Measurement = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        data.measurements.push(item);
        await writeData(data);
        return item;
      });
    },
    async updateMeasurement(id, input) {
      return withLock(async () => {
        const data = await readData();
        const index = data.measurements.findIndex((item) => item.id === id);
        if (index < 0) return null;
        data.measurements[index] = { ...data.measurements[index], ...input, id };
        await writeData(data);
        return data.measurements[index];
      });
    },
    async deleteMeasurement(id) {
      return withLock(async () => {
        const data = await readData();
        const before = data.measurements.length;
        data.measurements = data.measurements.filter((item) => item.id !== id);
        await writeData(data);
        return data.measurements.length < before;
      });
    },
  };
}
