import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  defaultPrice: real("default_price").notNull(),
  defaultBatchPrice: real("default_batch_price"),
  customerPrice: real("customer_price"),
  sellerPrice: real("seller_price"),
  customerBatchPrice: real("customer_batch_price"),
  sellerBatchPrice: real("seller_batch_price"),
  batchSize: integer("batch_size"),
  note: text("note"),
  imageUrl: text("image_url"),
  category: text("category"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date()
  ),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
