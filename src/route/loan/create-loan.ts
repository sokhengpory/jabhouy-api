import { createRoute, z } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';
import { createDb } from '~/db';
import { insertLoanSchema, loan, selectLoanSchema } from '~/db/schema';
import { customer } from '~/db/schema/customer.schema';
import type { AppRouteHandler } from '~/lib/type';

export const createLoanRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Loan'],
	request: {
		body: jsonContentRequired(
			insertLoanSchema.extend({
				createdAt: z.string().date().nullish().describe('YYYY-MM-DD'),
			}),
			'Create loan',
		),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			selectLoanSchema,
			'Created loan response',
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			createMessageObjectSchema('Customer not found'),
			'Customer not found',
		),
	},
});

export const createLoanHandler: AppRouteHandler<
	typeof createLoanRoute
> = async (c) => {
	const body = c.req.valid('json');
	const user = c.var.user;
	const db = createDb(c.env);

	const customerExists = await db
		.select({ id: customer.id })
		.from(customer)
		.where(and(eq(customer.id, body.customerId), eq(customer.userId, user.id)))
		.limit(1);

	if (customerExists.length === 0) {
		return c.json({ message: 'Customer not found' }, HttpStatusCodes.NOT_FOUND);
	}

	const { userId, customerId, ...rest } = getTableColumns(loan);

	const [created] = await db
		.insert(loan)
		.values({
			...body,
			createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
			updatedAt: body.createdAt ? new Date(body.createdAt) : new Date(),
			userId: user.id,
		})
		.returning(rest);

	const [result] = await db
		.select({
			...rest,
			customer: {
				id: customer.id,
				name: customer.name,
			},
		})
		.from(loan)
		.leftJoin(customer, eq(customer.id, loan.customerId))
		.where(eq(loan.id, created.id));

	return c.json(result, HttpStatusCodes.CREATED);
};
