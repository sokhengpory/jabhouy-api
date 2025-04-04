import { sql } from 'drizzle-orm';
import {
	index,
	integer,
	real,
	sqliteTable,
	text,
} from 'drizzle-orm/sqlite-core';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import { user } from './auth.schema';
import { category } from './category.schema';

export const item = sqliteTable(
	'item',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		basePrice: real('base_price'),
		customerPrice: real('customer_price').notNull(),
		sellerPrice: real('seller_price'),
		note: text('note'),
		imageUrl: text('image_url'),
		categoryId: integer('category_id').references(() => category.id, {
			onDelete: 'set null',
		}),
		createdAt: integer('created_at', { mode: 'timestamp' }).default(
			sql`(unixepoch())`,
		),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index('user_idx').on(table.userId),
		index('category_idx').on(table.categoryId),
	],
);

export const selectItemSchema = createSelectSchema(item).omit({
	userId: true,
	categoryId: true,
});
export const updateItemSchema = createUpdateSchema(item);
export const insertItemSchema = createInsertSchema(item).omit({
	userId: true,
});

export type Item = typeof item.$inferSelect;
export type InsertItem = typeof item.$inferInsert;
