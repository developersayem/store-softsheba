import { pgTable, serial, text, varchar, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";

export const productTypeEnum = pgEnum("product_type", ["standard", "subscription"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "yearly"]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("BDT"),
  image: varchar("image", { length: 255 }), // URL to product image
  type: productTypeEnum("type").default("standard").notNull(),
  billingCycle: billingCycleEnum("billing_cycle"), // Only required if type === 'subscription'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
