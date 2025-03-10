import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { user } from './auth.schema';

export const category = sqliteTable('category', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
});

export const insertCategorySchema = createInsertSchema(category).omit({
	userId: true,
});

export const selectCategorySchema = createSelectSchema(category).omit({
	userId: true,
});

export type Category = typeof category.$inferSelect;
export type InsertCategory = typeof category.$inferInsert;
