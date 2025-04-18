import { createRoute } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import { customer, loan, selectLoanSchema } from '~/db/schema';
import { idParamSchema, notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const getLoanRoute = createRoute({
	method: 'get',
	path: '/:id',
	tags: ['Loan'],
	request: {
		params: idParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectLoanSchema, 'Loan response'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Loan not found'),
	},
});

export const getLoanHandler: AppRouteHandler<typeof getLoanRoute> = async (
	c,
) => {
	const { id } = c.req.valid('param');
	const user = c.var.user;
	const db = createDb(c.env);

	const { userId, customerId, ...rest } = getTableColumns(loan);

	const [result] = await db
		.select({
			...rest,
			customer: {
				id: customer.id,
				name: customer.name,
			},
		})
		.from(loan)
		.leftJoin(customer, eq(loan.customerId, customer.id))
		.where(and(eq(loan.id, id), eq(loan.userId, user.id)));

	if (!result) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(result, HttpStatusCodes.OK);
};
