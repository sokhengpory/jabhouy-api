import { createRoute } from '@hono/zod-openapi';
import { eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { db } from '~/db';
import { insertLoanSchema, loan, selectLoanSchema } from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const createLoanRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Loan'],
	request: {
		body: jsonContentRequired(insertLoanSchema, 'Create loan'),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			selectLoanSchema,
			'Created loan response',
		),
	},
});

export const createLoanHandler: AppRouteHandler<
	typeof createLoanRoute
> = async (c) => {
	const body = c.req.valid('json');
	const user = c.var.user;

	const { userId, ...rest } = getTableColumns(loan);

	const [created] = await db
		.insert(loan)
		.values({ ...body, userId: user.id })
		.returning({
			id: loan.id,
		});

	const [result] = await db
		.select({
			...rest,
		})
		.from(loan)
		.where(eq(loan.id, created.id));

	return c.json(result, HttpStatusCodes.CREATED);
};
