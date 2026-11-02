import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { monthKeyIstanbul, slugify } from "../format";
import { matchesQuery } from "./paging";
import { SEED_PACKAGES } from "../seed-packages";
import { inferSubtype, SEED_SUBTYPES } from "../subtypes";
import { SEED_PRODUCTS } from "../seed-products";
import type { Measurement, Order, Product, ProductSubtype, StoreData, WeddingPackage } from "../types";
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
      products: (parsed.products ?? []).map((item) => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : [],
        subtypeSlug: item.subtypeSlug === undefined ? inferSubtype(item.categorySlug, item.tag) : item.subtypeSlug,
        bestSeller: Boolean(item.bestSeller),
        bestSellerOrder: Number(item.bestSellerOrder ?? 0),
      })),
      subtypes: parsed.subtypes ?? SEED_SUBTYPES.map((item) => ({ ...item })),
      orders: (parsed.orders ?? []).map((item) => ({
        ...item,
        address: item.address ?? "",
        notes: item.notes ?? "",
      })),
      measurements: (parsed.measurements ?? []).map((item) => ({
        ...item,
        appointmentAt: item.appointmentAt,
        status: item.status === "done" || item.status === "cancelled" ? item.status : "scheduled",
      })),
      packages: parsed.packages ?? SEED_PACKAGES.map((item) => ({ ...item })),
    };
  } catch {
    const seeded: StoreData = { products: SEED_PRODUCTS, orders: [], measurements: [], packages: SEED_PACKAGES, subtypes: SEED_SUBTYPES };
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
    async listProductsPage({ limit, offset, q }) {
      const products = (await this.listProducts()).filter((item) => matchesQuery(`${item.name} ${item.categoryLabel} ${item.tag}`, q));
      return { products: products.slice(offset, offset + limit), total: products.length };
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
    async listOrdersPage({ limit, offset, q, status }) {
      const orders = (await this.listOrders()).filter((item) => (!status || item.status === status) && matchesQuery(`${item.customerName} ${item.phone} ${item.product}`, q));
      return { orders: orders.slice(offset, offset + limit), total: orders.length };
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
          address: input.address ?? "",
          notes: input.notes ?? "",
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
    async listSubtypes(roomSlug) {
      const data = await readData();
      return (data.subtypes ?? []).filter((item) => !roomSlug || item.roomSlug === roomSlug).sort((a, b) => a.displayOrder - b.displayOrder);
    },
    async createSubtype(input) {
      return withLock(async () => {
        const data = await readData();
        const subtypes = data.subtypes ?? [];
        const item: ProductSubtype = { ...input, id: crypto.randomUUID() };
        data.subtypes = [...subtypes, item];
        await writeData(data);
        return item;
      });
    },
    async updateSubtype(id, input) {
      return withLock(async () => {
        const data = await readData();
        const subtypes = data.subtypes ?? [];
        const index = subtypes.findIndex((item) => item.id === id);
        if (index < 0) return null;
        subtypes[index] = { ...subtypes[index], ...input, id };
        data.subtypes = subtypes;
        await writeData(data);
        return subtypes[index];
      });
    },
    async deleteSubtype(id) {
      return withLock(async () => {
        const data = await readData();
        const subtypes = data.subtypes ?? [];
        const target = subtypes.find((item) => item.id === id);
        if (!target) return false;
        data.subtypes = subtypes.filter((item) => item.id !== id);
        data.products = data.products.map((item) => item.subtypeSlug === target.slug && item.categorySlug === target.roomSlug ? { ...item, subtypeSlug: null } : item);
        await writeData(data);
        return true;
      });
    },
    async listPackages() {
      const data = await readData();
      return [...(data.packages ?? [])].sort((a, b) => a.displayOrder - b.displayOrder || a.name.tr.localeCompare(b.name.tr, "tr"));
    },
    async getPackage(idOrSlug) {
      const data = await readData();
      return (data.packages ?? []).find((item) => item.id === idOrSlug || item.slug === idOrSlug) ?? null;
    },
    async createPackage(input) {
      return withLock(async () => {
        const data = await readData();
        const packages = data.packages ?? [];
        const base = input.slug || slugify(input.name.tr || "paket");
        let slug = base;
        let n = 2;
        while (packages.some((item) => item.slug === slug)) {
          slug = `${base}-${n}`;
          n += 1;
        }
        const item: WeddingPackage = { ...input, slug, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        data.packages = [...packages, item];
        await writeData(data);
        return item;
      });
    },
    async updatePackage(id, input) {
      return withLock(async () => {
        const data = await readData();
        const packages = data.packages ?? [];
        const index = packages.findIndex((item) => item.id === id);
        if (index < 0) return null;
        const current = packages[index];
        let slug = input.slug || current.slug;
        let n = 2;
        while (packages.some((item) => item.slug === slug && item.id !== id)) {
          slug = `${input.slug || current.slug}-${n}`;
          n += 1;
        }
        const next: WeddingPackage = { ...current, ...input, slug, id: current.id, createdAt: current.createdAt };
        packages[index] = next;
        data.packages = packages;
        await writeData(data);
        return next;
      });
    },
    async deletePackage(id) {
      return withLock(async () => {
        const data = await readData();
        const packages = data.packages ?? [];
        const next = packages.filter((item) => item.id !== id);
        if (next.length === packages.length) return false;
        data.packages = next;
        await writeData(data);
        return true;
      });
    },
    async listMeasurements() {
      const data = await readData();
      return [...data.measurements].sort((a, b) => a.appointmentAt.localeCompare(b.appointmentAt));
    },
    async listMeasurementsPage({ limit, offset, q }) {
      const measurements = (await this.listMeasurements()).filter(
        (item) => item.status !== "done" && item.status !== "cancelled" && matchesQuery(`${item.customerName} ${item.phone} ${item.address} ${item.notes}`, q),
      );
      return { measurements: measurements.slice(offset, offset + limit), total: measurements.length };
    },
    async dashboardSummary() {
      const data = await readData();
      const month = monthKeyIstanbul();
      const monthRevenue = data.orders
        .filter((order) => order.status === "completed" && order.completedAt && monthKeyIstanbul(new Date(order.completedAt)) === month)
        .reduce((sum, order) => sum + order.priceAmount, 0);
      return {
        activeOrders: data.orders.filter((order) => order.status === "active").length,
        pendingMeasurements: data.measurements.filter((item) => item.status !== "done" && item.status !== "cancelled").length,
        monthRevenue,
      };
    },
    async createMeasurement(input: MeasurementInput) {
      return withLock(async () => {
        const data = await readData();
        const item: Measurement = {
          ...input,
          status: input.status ?? "scheduled",
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
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
