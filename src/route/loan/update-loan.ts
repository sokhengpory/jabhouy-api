import { createRoute } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import {
	customer,
	loan,
	selectLoanSchema,
	updateLoanSchema,
} from '~/db/schema';
import { idParamSchema, notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const updateLoanRoute = createRoute({
	method: 'put',
	path: '/:id',
	tags: ['Loan'],
	request: {
		params: idParamSchema,
		body: jsonContentRequired(updateLoanSchema, 'Update loan'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectLoanSchema, 'Updated loan'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Loan not found'),
	},
});

export const updateLoanHandler: AppRouteHandler<
	typeof updateLoanRoute
> = async (c) => {
	const { id } = c.req.valid('param');
	const body = c.req.valid('json');
	const user = c.var.user;
	const db = createDb(c.env);
	const [existingLoan] = await db
		.select()
		.from(loan)
		.where(and(eq(loan.id, id), eq(loan.userId, user.id)));

	if (!existingLoan) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	const { userId, ...rest } = getTableColumns(loan);

	await db
		.update(loan)
		.set({
			...body,
			createdAt: body.createdAt
				? new Date(body.createdAt)
				: existingLoan.createdAt,
		})
		.where(and(eq(loan.id, id), eq(loan.userId, user.id)));

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
		.where(and(eq(loan.id, id), eq(loan.userId, user.id)));

	return c.json(result, HttpStatusCodes.OK);
};
