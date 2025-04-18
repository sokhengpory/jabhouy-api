import { createRoute } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import { customer, selectCustomerSchema } from '~/db/schema';
import { idParamSchema, notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const getCustomerRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Customer'],
	request: {
		params: idParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectCustomerSchema, 'Customer details'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			notFoundSchema,
			'Customer not found',
		),
	},
});

export const getCustomerHandler: AppRouteHandler<
	typeof getCustomerRoute
> = async (c) => {
	const { id } = c.req.valid('param');
	const user = c.var.user;
	const db = createDb(c.env);

	const { userId, ...rest } = getTableColumns(customer);

	const result = await db
		.select({
			...rest,
		})
		.from(customer)
		.where(and(eq(customer.id, id), eq(customer.userId, user.id)))
		.get();

	if (!result) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(result, HttpStatusCodes.OK);
};
