import { createRoute } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import { customer } from '~/db/schema';
import { idParamSchema, notFoundSchema, okSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const deleteCustomerRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Customer'],
	request: {
		params: idParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(okSchema, 'Customer deleted'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			notFoundSchema,
			'Customer not found',
		),
	},
});

export const deleteCustomerHandler: AppRouteHandler<
	typeof deleteCustomerRoute
> = async (c) => {
	const { id } = c.req.valid('param');
	const user = c.var.user;
	const db = createDb(c.env);

	const [deleted] = await db
		.delete(customer)
		.where(and(eq(customer.id, id), eq(customer.userId, user.id)))
		.returning({
			id: customer.id,
		});

	if (!deleted) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(
		{
			message: HttpStatusPhrases.OK,
		},
		HttpStatusCodes.OK,
	);
};
