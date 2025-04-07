import { z } from '@hono/zod-openapi';
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
import { customer } from './customer.schema';

export const loan = sqliteTable(
	'loan',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		customerId: integer('customer_id')
			.notNull()
			.references(() => customer.id, { onDelete: 'cascade' }),
		amount: real('amount').notNull(),
		note: text('note'),
		createdAt: integer('created_at', { mode: 'timestamp' }).default(
			sql`(unixepoch())`,
		),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date()),
		paid: integer('paid', { mode: 'boolean' }).default(false),
	},
	(table) => [index('loan_user_idx').on(table.userId)],
);

export const selectLoanSchema = createSelectSchema(loan).omit({
	userId: true,
	customerId: true,
});

export const updateLoanSchema = createUpdateSchema(loan)
	.omit({
		id: true,
		userId: true,
		createdAt: true,
		updatedAt: true,
	})
	.extend({ createdAt: z.string().date().optional() });

export const insertLoanSchema = createInsertSchema(loan).omit({
	userId: true,
	id: true,
	createdAt: true,
	updatedAt: true,
});

export type Loan = typeof loan.$inferSelect;
export type InsertLoan = typeof loan.$inferInsert;
