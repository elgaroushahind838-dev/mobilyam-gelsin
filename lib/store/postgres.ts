import { neon } from "@neondatabase/serverless";
import { slugify } from "../format";
import { SEED_PRODUCTS } from "../seed-products";
import type { Measurement, Order, Product } from "../types";
import type { MeasurementInput, OrderInput, ProductInput, Store } from "./types";

type Query = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

let ready: Promise<Query> | null = null;

function sqlClient() {
  if (!ready) {
    const sql = neon(process.env.DATABASE_URL!) as unknown as Query;
    ready = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS products (
        id text PRIMARY KEY,
        slug text UNIQUE NOT NULL,
        name text NOT NULL,
        name_en text NOT NULL DEFAULT '',
        name_ar text NOT NULL DEFAULT '',
        description text NOT NULL DEFAULT '',
        description_en text NOT NULL DEFAULT '',
        description_ar text NOT NULL DEFAULT '',
        price text NOT NULL,
        price_amount integer NOT NULL DEFAULT 0,
        category_slug text NOT NULL,
        category_label text NOT NULL,
        tag text NOT NULL DEFAULT '',
        width text NOT NULL DEFAULT '',
        depth text NOT NULL DEFAULT '',
        height text NOT NULL DEFAULT '',
        images jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS orders (
        id text PRIMARY KEY,
        status text NOT NULL,
        customer_name text NOT NULL,
        phone text NOT NULL,
        product text NOT NULL,
        price text NOT NULL,
        price_amount integer NOT NULL DEFAULT 0,
        order_date date NOT NULL,
        address text NOT NULL DEFAULT '',
        notes text NOT NULL DEFAULT '',
        completed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT ''`;
      await sql`ALTER TABLE products ALTER COLUMN price DROP NOT NULL`;
      await sql`ALTER TABLE products ALTER COLUMN price_amount DROP NOT NULL`;
      await sql`ALTER TABLE products ALTER COLUMN width DROP NOT NULL`;
      await sql`ALTER TABLE products ALTER COLUMN depth DROP NOT NULL`;
      await sql`ALTER TABLE products ALTER COLUMN height DROP NOT NULL`;
      await sql`CREATE TABLE IF NOT EXISTS measurements (
        id text PRIMARY KEY,
        customer_name text NOT NULL,
        phone text NOT NULL,
        address text NOT NULL,
        appointment_at timestamptz NOT NULL,
        notes text NOT NULL DEFAULT '',
        status text NOT NULL DEFAULT 'scheduled',
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`ALTER TABLE measurements ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'scheduled'`;
      const count = await sql`SELECT COUNT(*)::int AS count FROM products`;
      if (Number(count[0]?.count ?? 0) === 0) {
        for (const item of SEED_PRODUCTS) {
          await sql`INSERT INTO products (
            id, slug, name, name_en, name_ar, description, description_en, description_ar,
            price, price_amount, category_slug, category_label, tag, width, depth, height, images, created_at
          ) VALUES (
            ${item.id}, ${item.slug}, ${item.name}, ${item.nameEn}, ${item.nameAr},
            ${item.description}, ${item.descriptionEn}, ${item.descriptionAr},
            ${item.price}, ${item.priceAmount}, ${item.categorySlug}, ${item.categoryLabel}, ${item.tag},
            ${item.width}, ${item.depth}, ${item.height}, ${JSON.stringify(item.images)}::jsonb, ${item.createdAt}
          ) ON CONFLICT (id) DO NOTHING`;
        }
      }
      return sql;
    })();
  }
  return ready;
}

function asProduct(row: Record<string, unknown>): Product {
  const images = Array.isArray(row.images) ? (row.images as string[]) : [];
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    nameEn: String(row.name_en ?? ""),
    nameAr: String(row.name_ar ?? ""),
    description: String(row.description ?? ""),
    descriptionEn: String(row.description_en ?? ""),
    descriptionAr: String(row.description_ar ?? ""),
    price: String(row.price),
    priceAmount: Number(row.price_amount ?? 0),
    categorySlug: String(row.category_slug),
    categoryLabel: String(row.category_label),
    tag: String(row.tag ?? ""),
    width: String(row.width ?? ""),
    depth: String(row.depth ?? ""),
    height: String(row.height ?? ""),
    images,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function asOrder(row: Record<string, unknown>): Order {
  const orderDate = row.order_date instanceof Date
    ? row.order_date.toISOString().slice(0, 10)
    : String(row.order_date).slice(0, 10);
  return {
    id: String(row.id),
    status: row.status === "completed" ? "completed" : "active",
    customerName: String(row.customer_name),
    phone: String(row.phone),
    product: String(row.product),
    price: String(row.price ?? ""),
    priceAmount: Number(row.price_amount ?? 0),
    orderDate,
    address: String(row.address ?? ""),
    notes: String(row.notes ?? ""),
    completedAt: row.completed_at ? new Date(String(row.completed_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

function asMeasurement(row: Record<string, unknown>): Measurement {
  return {
    id: String(row.id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    address: String(row.address),
    appointmentAt: new Date(String(row.appointment_at)).toISOString(),
    notes: String(row.notes ?? ""),
    status: row.status === "done" || row.status === "cancelled" ? row.status : "scheduled",
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

async function uniqueSlug(sql: Query, base: string, currentId?: string) {
  let slug = base;
  let n = 2;
  for (;;) {
    const rows = await sql`SELECT id FROM products WHERE slug = ${slug} LIMIT 1`;
    if (!rows[0] || rows[0].id === currentId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export function createPostgresStore(): Store {
  return {
    async listProducts() {
      const sql = await sqlClient();
      const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
      return rows.map((row) => asProduct(row as Record<string, unknown>));
    },
    async getProduct(idOrSlug) {
      const sql = await sqlClient();
      const rows = await sql`SELECT * FROM products WHERE id = ${idOrSlug} OR slug = ${idOrSlug} LIMIT 1`;
      return rows[0] ? asProduct(rows[0] as Record<string, unknown>) : null;
    },
    async createProduct(input: ProductInput) {
      const sql = await sqlClient();
      const id = crypto.randomUUID();
      const slug = await uniqueSlug(sql, input.slug || slugify(input.name));
      const images = input.images.filter(Boolean);
      const rows = await sql`INSERT INTO products (
        id, slug, name, name_en, name_ar, description, description_en, description_ar,
        price, price_amount, category_slug, category_label, tag, width, depth, height, images
      ) VALUES (
        ${id}, ${slug}, ${input.name}, ${input.nameEn}, ${input.nameAr},
        ${input.description}, ${input.descriptionEn}, ${input.descriptionAr},
        ${input.price}, ${input.priceAmount}, ${input.categorySlug}, ${input.categoryLabel}, ${input.tag},
        ${input.width}, ${input.depth}, ${input.height}, ${JSON.stringify(images)}::jsonb
      ) RETURNING *`;
      return asProduct(rows[0] as Record<string, unknown>);
    },
    async updateProduct(id, input) {
      const sql = await sqlClient();
      const current = await sql`SELECT slug FROM products WHERE id = ${id} LIMIT 1`;
      if (!current[0]) return null;
      const slug = await uniqueSlug(sql, input.slug || String(current[0].slug), id);
      const images = input.images.filter(Boolean);
      const rows = await sql`UPDATE products SET
        slug = ${slug}, name = ${input.name}, name_en = ${input.nameEn}, name_ar = ${input.nameAr},
        description = ${input.description}, description_en = ${input.descriptionEn}, description_ar = ${input.descriptionAr},
        price = ${input.price}, price_amount = ${input.priceAmount}, category_slug = ${input.categorySlug},
        category_label = ${input.categoryLabel}, tag = ${input.tag}, width = ${input.width}, depth = ${input.depth},
        height = ${input.height}, images = ${JSON.stringify(images)}::jsonb
        WHERE id = ${id} RETURNING *`;
      return rows[0] ? asProduct(rows[0] as Record<string, unknown>) : null;
    },
    async deleteProduct(id) {
      const sql = await sqlClient();
      const rows = await sql`DELETE FROM products WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    async listOrders() {
      const sql = await sqlClient();
      const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
      return rows.map((row) => asOrder(row as Record<string, unknown>));
    },
    async createOrder(input: OrderInput) {
      const sql = await sqlClient();
      const id = crypto.randomUUID();
      const status = input.status ?? "active";
      const completedAt = status === "completed" ? new Date().toISOString() : null;
      const rows = await sql`INSERT INTO orders (
        id, status, customer_name, phone, product, price, price_amount, order_date, address, notes, completed_at
      ) VALUES (
        ${id}, ${status}, ${input.customerName}, ${input.phone}, ${input.product}, ${input.price},
        ${input.priceAmount}, ${input.orderDate}, ${input.address ?? ""}, ${input.notes ?? ""}, ${completedAt}
      ) RETURNING *`;
      return asOrder(rows[0] as Record<string, unknown>);
    },
    async updateOrder(id, input) {
      const sql = await sqlClient();
      const currentRows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
      if (!currentRows[0]) return null;
      const current = asOrder(currentRows[0] as Record<string, unknown>);
      const next = { ...current, ...input, id: current.id, createdAt: current.createdAt };
      const rows = await sql`UPDATE orders SET
        status = ${next.status}, customer_name = ${next.customerName}, phone = ${next.phone},
        product = ${next.product}, price = ${next.price}, price_amount = ${next.priceAmount},
        order_date = ${next.orderDate}, address = ${next.address}, notes = ${next.notes},
        completed_at = ${next.completedAt}
        WHERE id = ${id} RETURNING *`;
      return rows[0] ? asOrder(rows[0] as Record<string, unknown>) : null;
    },
    async completeOrder(id) {
      const sql = await sqlClient();
      const rows = await sql`UPDATE orders SET status = 'completed', completed_at = now() WHERE id = ${id} RETURNING *`;
      return rows[0] ? asOrder(rows[0] as Record<string, unknown>) : null;
    },
    async deleteOrder(id) {
      const sql = await sqlClient();
      const rows = await sql`DELETE FROM orders WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    async listMeasurements() {
      const sql = await sqlClient();
      const rows = await sql`SELECT * FROM measurements ORDER BY appointment_at ASC`;
      return rows.map((row) => asMeasurement(row as Record<string, unknown>));
    },
    async createMeasurement(input: MeasurementInput) {
      const sql = await sqlClient();
      const id = crypto.randomUUID();
      const status = input.status ?? "scheduled";
      const rows = await sql`INSERT INTO measurements (
        id, customer_name, phone, address, appointment_at, notes, status
      ) VALUES (
        ${id}, ${input.customerName}, ${input.phone}, ${input.address}, ${input.appointmentAt}, ${input.notes}, ${status}
      ) RETURNING *`;
      return asMeasurement(rows[0] as Record<string, unknown>);
    },
    async updateMeasurement(id, input) {
      const sql = await sqlClient();
      const current = await sql`SELECT status FROM measurements WHERE id = ${id} LIMIT 1`;
      if (!current[0]) return null;
      const stored = current[0].status === "done" || current[0].status === "cancelled" ? current[0].status : "scheduled";
      const status = input.status ?? stored;
      const rows = await sql`UPDATE measurements SET
        customer_name = ${input.customerName}, phone = ${input.phone}, address = ${input.address},
        appointment_at = ${input.appointmentAt}, notes = ${input.notes}, status = ${status}
        WHERE id = ${id} RETURNING *`;
      return rows[0] ? asMeasurement(rows[0] as Record<string, unknown>) : null;
    },
    async deleteMeasurement(id) {
      const sql = await sqlClient();
      const rows = await sql`DELETE FROM measurements WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
  };
}
