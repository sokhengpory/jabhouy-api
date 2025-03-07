import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const category = sqliteTable('category', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
});

export const insertCategorySchema = createInsertSchema(category);
export const selectCategorySchema = createSelectSchema(category);

export type Category = typeof category.$inferSelect;
export type InsertCategory = typeof category.$inferInsert;
