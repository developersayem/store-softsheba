import { pgTable, serial, integer, text, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const refundStatusEnum = pgEnum("refund_status", ["requested", "approved", "rejected"]);

export const refunds = pgTable("refunds", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: refundStatusEnum("status").default("requested").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
