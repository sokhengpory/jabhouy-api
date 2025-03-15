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

export const loan = sqliteTable(
	'loan',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		amount: real('amount').notNull(),
		note: text('note'),
		createdAt: integer('created_at', { mode: 'timestamp' }).default(
			sql`(unixepoch())`,
		),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date()),
	},
	(table) => [index('loan_user_idx').on(table.userId)],
);

export const selectLoanSchema = createSelectSchema(loan).omit({
	userId: true,
});

export const updateLoanSchema = createUpdateSchema(loan).omit({
	id: true,
	userId: true,
	createdAt: true,
	updatedAt: true,
});

export const insertLoanSchema = createInsertSchema(loan).omit({
	userId: true,
	id: true,
	createdAt: true,
	updatedAt: true,
});

export type Loan = typeof loan.$inferSelect;
export type InsertLoan = typeof loan.$inferInsert;
