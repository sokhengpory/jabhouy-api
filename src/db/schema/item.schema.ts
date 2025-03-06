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

export const items = sqliteTable(
	'items',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		basePrice: real('base_price').notNull(),
		defaultBatchPrice: real('default_batch_price'),
		customerPrice: real('customer_price'),
		sellerPrice: real('seller_price'),
		customerBatchPrice: real('customer_batch_price'),
		sellerBatchPrice: real('seller_batch_price'),
		batchSize: integer('batch_size'),
		note: text('note'),
		imageUrl: text('image_url'),
		category: text('category'),
		createdAt: integer('created_at', { mode: 'timestamp' }).default(
			sql`(unixepoch())`,
		),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(
			() => new Date(),
		),
	},
	(table) => [index('user_idx').on(table.userId)],
);

export const itemSchema = createSelectSchema(items);
export const updateItemSchema = createUpdateSchema(items);
export const insertItemSchema = createInsertSchema(items).omit({
	userId: true,
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
