import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  shopName: text("shop_name").notNull(),
  slogan: text("slogan").notNull().default(""),
  logoUrl: text("logo_url").notNull().default("/brand/bakirkoy-logo.png"),
  faviconUrl: text("favicon_url"),
  accentColor: text("accent_color").notNull().default("#F2E14C"),
  secondaryColor: text("secondary_color").notNull().default("#2438E8"),
  showPrices: boolean("show_prices").notNull().default(true),
  commerceEnabled: boolean("commerce_enabled").notNull().default(false),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  email: text("email").notNull().default(""),
  address: text("address").notNull().default(""),
  district: text("district").notNull().default(""),
  city: text("city").notNull().default(""),
  hours: jsonb("hours")
    .$type<Record<string, { open: string; close: string } | null>>()
    .notNull()
    .default({}),
  mapEmbedUrl: text("map_embed_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  sku: text("sku").notNull().unique(),
  price: integer("price").notNull(),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  note: text("note"),
  status: text("status").notNull().default("pending"),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
