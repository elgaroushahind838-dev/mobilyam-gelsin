import { neon } from "@neondatabase/serverless";
import { monthKeyIstanbul, slugify } from "../format";
import { SEED_PACKAGES } from "../seed-packages";
import { inferSubtype, SEED_SUBTYPES } from "../subtypes";
import { SEED_PRODUCTS } from "../seed-products";
import type { Measurement, Order, Product, ProductSubtype, WeddingPackage } from "../types";
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
        subtype_slug text,
        best_seller boolean NOT NULL DEFAULT false,
        best_seller_order integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS subtype_slug text`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller boolean NOT NULL DEFAULT false`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS best_seller_order integer NOT NULL DEFAULT 0`;
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
      await sql`CREATE TABLE IF NOT EXISTS wedding_packages (
        id text PRIMARY KEY,
        slug text UNIQUE NOT NULL,
        active boolean NOT NULL DEFAULT true,
        display_order integer NOT NULL DEFAULT 0,
        content jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders (status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS orders_completed_at_idx ON orders (status, completed_at)`;
      await sql`CREATE INDEX IF NOT EXISTS measurements_status_at_idx ON measurements (status, appointment_at)`;
      await sql`CREATE INDEX IF NOT EXISTS products_created_idx ON products (created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS products_category_idx ON products (category_slug)`;
      await sql`CREATE INDEX IF NOT EXISTS packages_order_idx ON wedding_packages (display_order, created_at)`;
      await sql`CREATE TABLE IF NOT EXISTS product_subtypes (
        id text PRIMARY KEY,
        room_slug text NOT NULL,
        slug text NOT NULL,
        label_tr text NOT NULL,
        label_en text NOT NULL,
        label_ar text NOT NULL,
        display_order integer NOT NULL DEFAULT 0,
        UNIQUE (room_slug, slug)
      )`;
      await sql`CREATE INDEX IF NOT EXISTS subtypes_room_order_idx ON product_subtypes (room_slug, display_order)`;
      for (const item of SEED_SUBTYPES) {
        await sql`INSERT INTO product_subtypes (id, room_slug, slug, label_tr, label_en, label_ar, display_order)
          VALUES (${item.id}, ${item.roomSlug}, ${item.slug}, ${item.label.tr}, ${item.label.en}, ${item.label.ar}, ${item.displayOrder})
          ON CONFLICT (room_slug, slug) DO NOTHING`;
      }
      const rooms = ["yatak-odasi", "genc-odasi", "ofis", "portmanto"] as const;
      for (const room of rooms) {
        const rows = await sql`SELECT id, tag FROM products WHERE subtype_slug IS NULL AND category_slug = ${room}`;
        for (const row of rows) {
          const guessed = inferSubtype(room, String(row.tag ?? ""));
          if (guessed) await sql`UPDATE products SET subtype_slug = ${guessed} WHERE id = ${row.id} AND subtype_slug IS NULL`;
        }
      }
      for (const item of SEED_PACKAGES) {
        const content = packageContent(item);
        await sql`INSERT INTO wedding_packages (id, slug, active, display_order, content, created_at)
          VALUES (${item.id}, ${item.slug}, ${item.active}, ${item.displayOrder}, ${JSON.stringify(content)}::jsonb, ${item.createdAt})
          ON CONFLICT (slug) DO NOTHING`;
      }
      const count = await sql`SELECT COUNT(*)::int AS count FROM products`;
      if (Number(count[0]?.count ?? 0) === 0) {
        for (const item of SEED_PRODUCTS) {
          await sql`INSERT INTO products (
            id, slug, name, name_en, name_ar, description, description_en, description_ar,
            price, price_amount, category_slug, category_label, tag, width, depth, height, images, best_seller, best_seller_order, created_at
          ) VALUES (
            ${item.id}, ${item.slug}, ${item.name}, ${item.nameEn}, ${item.nameAr},
            ${item.description}, ${item.descriptionEn}, ${item.descriptionAr},
            ${item.price}, ${item.priceAmount}, ${item.categorySlug}, ${item.categoryLabel}, ${item.tag},
            ${item.width}, ${item.depth}, ${item.height}, ${JSON.stringify(item.images)}::jsonb, ${Boolean(item.bestSeller)}, ${Number(item.bestSellerOrder || 0)}, ${item.createdAt}
          ) ON CONFLICT (id) DO NOTHING`;
        }
      }
      for (const room of rooms) {
        const rows = await sql`SELECT id, tag FROM products WHERE subtype_slug IS NULL AND category_slug = ${room}`;
        for (const row of rows) {
          const guessed = inferSubtype(room, String(row.tag ?? ""));
          if (guessed) await sql`UPDATE products SET subtype_slug = ${guessed} WHERE id = ${row.id} AND subtype_slug IS NULL`;
        }
      }
      return sql;
    })();
  }
  return ready;
}

function asProduct(row: Record<string, unknown>): Product {
  const images = Array.isArray(row.images)
    ? (row.images as string[])
    : typeof row.images === "string" && row.images
      ? [row.images]
      : [];
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
    subtypeSlug: row.subtype_slug ? String(row.subtype_slug) : null,
    width: String(row.width ?? ""),
    depth: String(row.depth ?? ""),
    height: String(row.height ?? ""),
    images,
    bestSeller: row.best_seller === true || row.best_seller === "t" || row.best_seller === "true",
    bestSellerOrder: Number(row.best_seller_order ?? 0),
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

function packageContent(item: WeddingPackage) {
  const { id, slug, active, displayOrder, createdAt, ...content } = item;
  return content;
}

function asSubtype(row: Record<string, unknown>): ProductSubtype {
  return {
    id: String(row.id),
    roomSlug: String(row.room_slug),
    slug: String(row.slug),
    label: { tr: String(row.label_tr), en: String(row.label_en), ar: String(row.label_ar) },
    displayOrder: Number(row.display_order ?? 0),
  };
}

function asPackage(row: Record<string, unknown>): WeddingPackage {
  const content = (typeof row.content === "string" ? JSON.parse(row.content) : row.content) as Omit<WeddingPackage, "id" | "slug" | "active" | "displayOrder" | "createdAt">;
  return {
    ...content,
    id: String(row.id),
    slug: String(row.slug),
    active: row.active === true || row.active === "t" || row.active === "true",
    displayOrder: Number(row.display_order ?? 0),
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
    async listProductsPage({ limit, offset, q }) {
      const sql = await sqlClient();
      const like = `%${q}%`;
      const [rows, count] = await Promise.all([
        sql`SELECT * FROM products
          WHERE (${q} = '' OR name ILIKE ${like} OR category_label ILIKE ${like} OR tag ILIKE ${like})
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        sql`SELECT COUNT(*)::int AS count FROM products
          WHERE (${q} = '' OR name ILIKE ${like} OR category_label ILIKE ${like} OR tag ILIKE ${like})`,
      ]);
      return { products: rows.map((row) => asProduct(row as Record<string, unknown>)), total: Number(count[0]?.count ?? 0) };
    },
    async productCounts() {
      const sql = await sqlClient();
      const rows = await sql`SELECT category_slug, COUNT(*)::int AS count FROM products GROUP BY category_slug`;
      const byCategory: Record<string, number> = {};
      for (const row of rows) byCategory[String(row.category_slug)] = Number(row.count ?? 0);
      const total = Object.values(byCategory).reduce((sum, count) => sum + count, 0);
      return { total, byCategory };
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
        price, price_amount, category_slug, category_label, tag, subtype_slug, width, depth, height, images, best_seller, best_seller_order
      ) VALUES (
        ${id}, ${slug}, ${input.name}, ${input.nameEn}, ${input.nameAr},
        ${input.description}, ${input.descriptionEn}, ${input.descriptionAr},
        ${input.price}, ${input.priceAmount}, ${input.categorySlug}, ${input.categoryLabel}, ${input.tag}, ${input.subtypeSlug},
        ${input.width}, ${input.depth}, ${input.height}, ${JSON.stringify(images)}::jsonb,
        ${Boolean(input.bestSeller)}, ${Number(input.bestSellerOrder || 0)}
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
        category_label = ${input.categoryLabel}, tag = ${input.tag}, subtype_slug = ${input.subtypeSlug}, width = ${input.width}, depth = ${input.depth},
        height = ${input.height}, images = ${JSON.stringify(images)}::jsonb,
        best_seller = ${Boolean(input.bestSeller)}, best_seller_order = ${Number(input.bestSellerOrder || 0)}
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
    async listOrdersPage({ limit, offset, q, status }) {
      const sql = await sqlClient();
      const like = `%${q}%`;
      const [rows, count] = await Promise.all([
        sql`SELECT * FROM orders
          WHERE (${status ?? null}::text IS NULL OR status = ${status ?? null})
          AND (${q} = '' OR customer_name ILIKE ${like} OR phone ILIKE ${like} OR product ILIKE ${like})
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
        sql`SELECT COUNT(*)::int AS count FROM orders
          WHERE (${status ?? null}::text IS NULL OR status = ${status ?? null})
          AND (${q} = '' OR customer_name ILIKE ${like} OR phone ILIKE ${like} OR product ILIKE ${like})`,
      ]);
      return { orders: rows.map((row) => asOrder(row as Record<string, unknown>)), total: Number(count[0]?.count ?? 0) };
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
    async listSubtypes(roomSlug) {
      const sql = await sqlClient();
      const rows = roomSlug
        ? await sql`SELECT * FROM product_subtypes WHERE room_slug = ${roomSlug} ORDER BY display_order ASC`
        : await sql`SELECT * FROM product_subtypes ORDER BY room_slug ASC, display_order ASC`;
      return rows.map((row) => asSubtype(row as Record<string, unknown>));
    },
    async createSubtype(input) {
      const sql = await sqlClient();
      const id = crypto.randomUUID();
      const rows = await sql`INSERT INTO product_subtypes (id, room_slug, slug, label_tr, label_en, label_ar, display_order)
        VALUES (${id}, ${input.roomSlug}, ${input.slug}, ${input.label.tr}, ${input.label.en}, ${input.label.ar}, ${input.displayOrder})
        RETURNING *`;
      return asSubtype(rows[0] as Record<string, unknown>);
    },
    async updateSubtype(id, input) {
      const sql = await sqlClient();
      const rows = await sql`UPDATE product_subtypes SET
        room_slug = ${input.roomSlug}, slug = ${input.slug}, label_tr = ${input.label.tr}, label_en = ${input.label.en},
        label_ar = ${input.label.ar}, display_order = ${input.displayOrder}
        WHERE id = ${id} RETURNING *`;
      return rows[0] ? asSubtype(rows[0] as Record<string, unknown>) : null;
    },
    async deleteSubtype(id) {
      const sql = await sqlClient();
      const current = await sql`SELECT room_slug, slug FROM product_subtypes WHERE id = ${id} LIMIT 1`;
      if (!current[0]) return false;
      await sql`UPDATE products SET subtype_slug = NULL WHERE category_slug = ${current[0].room_slug} AND subtype_slug = ${current[0].slug}`;
      const rows = await sql`DELETE FROM product_subtypes WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    async listPackages() {
      const sql = await sqlClient();
      const rows = await sql`SELECT * FROM wedding_packages ORDER BY display_order ASC, created_at ASC`;
      return rows.map((row) => asPackage(row as Record<string, unknown>));
    },
    async getPackage(idOrSlug) {
      const sql = await sqlClient();
      const rows = await sql`SELECT * FROM wedding_packages WHERE id = ${idOrSlug} OR slug = ${idOrSlug} LIMIT 1`;
      return rows[0] ? asPackage(rows[0] as Record<string, unknown>) : null;
    },
    async createPackage(input) {
      const sql = await sqlClient();
      const id = crypto.randomUUID();
      let slug = input.slug || slugify(input.name.tr || "paket");
      let n = 2;
      for (;;) {
        const existing = await sql`SELECT id FROM wedding_packages WHERE slug = ${slug} LIMIT 1`;
        if (!existing[0]) break;
        slug = `${input.slug || slugify(input.name.tr || "paket")}-${n}`;
        n += 1;
      }
      const item: WeddingPackage = { ...input, id, slug, createdAt: new Date().toISOString() };
      const rows = await sql`INSERT INTO wedding_packages (id, slug, active, display_order, content)
        VALUES (${item.id}, ${item.slug}, ${item.active}, ${item.displayOrder}, ${JSON.stringify(packageContent(item))}::jsonb)
        RETURNING *`;
      return asPackage(rows[0] as Record<string, unknown>);
    },
    async updatePackage(id, input) {
      const sql = await sqlClient();
      const currentRows = await sql`SELECT * FROM wedding_packages WHERE id = ${id} LIMIT 1`;
      if (!currentRows[0]) return null;
      const current = asPackage(currentRows[0] as Record<string, unknown>);
      let slug = input.slug || current.slug;
      let n = 2;
      for (;;) {
        const existing = await sql`SELECT id FROM wedding_packages WHERE slug = ${slug} AND id <> ${id} LIMIT 1`;
        if (!existing[0]) break;
        slug = `${input.slug || current.slug}-${n}`;
        n += 1;
      }
      const next: WeddingPackage = { ...current, ...input, id, slug, createdAt: current.createdAt };
      const rows = await sql`UPDATE wedding_packages SET
        slug = ${next.slug}, active = ${next.active}, display_order = ${next.displayOrder},
        content = ${JSON.stringify(packageContent(next))}::jsonb
        WHERE id = ${id} RETURNING *`;
      return rows[0] ? asPackage(rows[0] as Record<string, unknown>) : null;
    },
    async deletePackage(id) {
      const sql = await sqlClient();
      const rows = await sql`DELETE FROM wedding_packages WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
    async listMeasurements() {
      const sql = await sqlClient();
      const rows = await sql`SELECT * FROM measurements ORDER BY appointment_at ASC`;
      return rows.map((row) => asMeasurement(row as Record<string, unknown>));
    },
    async listMeasurementsPage({ limit, offset, q }) {
      const sql = await sqlClient();
      const like = `%${q}%`;
      const [rows, count] = await Promise.all([
        sql`SELECT * FROM measurements
          WHERE status <> 'done' AND status <> 'cancelled'
          AND (${q} = '' OR customer_name ILIKE ${like} OR phone ILIKE ${like} OR address ILIKE ${like} OR notes ILIKE ${like})
          ORDER BY appointment_at ASC LIMIT ${limit} OFFSET ${offset}`,
        sql`SELECT COUNT(*)::int AS count FROM measurements
          WHERE status <> 'done' AND status <> 'cancelled'
          AND (${q} = '' OR customer_name ILIKE ${like} OR phone ILIKE ${like} OR address ILIKE ${like} OR notes ILIKE ${like})`,
      ]);
      return { measurements: rows.map((row) => asMeasurement(row as Record<string, unknown>)), total: Number(count[0]?.count ?? 0) };
    },
    async dashboardSummary() {
      const sql = await sqlClient();
      const month = monthKeyIstanbul();
      const [active, pending, revenue] = await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM orders WHERE status = 'active'`,
        sql`SELECT COUNT(*)::int AS count FROM measurements WHERE status <> 'done' AND status <> 'cancelled'`,
        sql`SELECT COALESCE(SUM(price_amount), 0)::int AS total FROM orders
          WHERE status = 'completed' AND completed_at IS NOT NULL
          AND to_char(completed_at AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM') = ${month}`,
      ]);
      return {
        activeOrders: Number(active[0]?.count ?? 0),
        pendingMeasurements: Number(pending[0]?.count ?? 0),
        monthRevenue: Number(revenue[0]?.total ?? 0),
      };
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
