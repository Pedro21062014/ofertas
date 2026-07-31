import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  shopeeUrl: text("shopee_url").notNull(),
  price: integer("price").notNull().default(0),
  category: varchar("category", { length: 100 }).notNull().default("Geral"),
  isActive: boolean("is_active").notNull().default(true),
  shopName: varchar("shop_name", { length: 160 }),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  sales: integer("sales").notNull().default(0),
  discount: integer("discount").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
