import { pgTable, serial, integer, text, varchar, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { products } from "./products";

export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "refunded", "failed"]);
export const paymentGatewayEnum = pgEnum("payment_gateway", ["bkash", "stripe", "manual"]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BDT"),
  paymentGateway: paymentGatewayEnum("payment_gateway"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
});
