import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: text("customer_id").notNull().references(() => customers.id),
  email: text("email").notNull(),
  status: text("status").notNull().default("payment_pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentProvider: text("payment_provider").notNull(),
  paymentReference: text("payment_reference"),
  currency: text("currency").notNull().default("EUR"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull(),
  vatCents: integer("vat_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  vatRateBps: integer("vat_rate_bps").notNull(),
  buyerType: text("buyer_type").notNull().default("consumer"),
  vatId: text("vat_id"),
  fullName: text("full_name").notNull(),
  company: text("company"),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  configuration: text("configuration").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  provider: text("provider").notNull(),
  providerReference: text("provider_reference").notNull(),
  status: text("status").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  isSandbox: integer("is_sandbox", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const shipments = sqliteTable("shipments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  status: text("status").notNull().default("preorder_received"),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  estimatedDispatch: text("estimated_dispatch"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

