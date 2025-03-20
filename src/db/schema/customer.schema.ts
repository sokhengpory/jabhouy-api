import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod';
import { user } from './auth.schema';

export const customer = sqliteTable(
	'customer',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).default(
			sql`(unixepoch())`,
		),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date()),
	},
	(table) => [index('customer_user_idx').on(table.userId)],
);

export const selectCustomerSchema = createSelectSchema(customer).omit({
	userId: true,
});

export const updateCustomerSchema = createUpdateSchema(customer).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customer).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});

export type Customer = typeof customer.$inferSelect;
export type InsertCustomer = typeof customer.$inferInsert;
