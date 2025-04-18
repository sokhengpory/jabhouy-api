import { createRoute } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import {
	customer,
	selectCustomerSchema,
	updateCustomerSchema,
} from '~/db/schema';
import { idParamSchema, notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const updateCustomerRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Customer'],
	request: {
		params: idParamSchema,
		body: jsonContentRequired(updateCustomerSchema, 'Update customer'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectCustomerSchema, 'Updated customer'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			notFoundSchema,
			'Customer not found',
		),
	},
});

export const updateCustomerHandler: AppRouteHandler<
	typeof updateCustomerRoute
> = async (c) => {
	const { id } = c.req.valid('param');
	const body = c.req.valid('json');
	const user = c.var.user;
	const db = createDb(c.env);

	const { userId, ...rest } = getTableColumns(customer);

	const [updated] = await db
		.update(customer)
		.set(body)
		.where(and(eq(customer.id, id), eq(customer.userId, user.id)))
		.returning(rest);

	if (!updated) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(updated, HttpStatusCodes.OK);
};
