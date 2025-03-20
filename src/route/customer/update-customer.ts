import { createRoute } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { db } from '~/db';
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

	const { userId, ...rest } = getTableColumns(customer);

	const exists = await db
		.select({ id: customer.id })
		.from(customer)
		.where(and(eq(customer.id, id), eq(customer.userId, user.id)))
		.get();

	if (!exists) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	await db
		.update(customer)
		.set(body)
		.where(and(eq(customer.id, id), eq(customer.userId, user.id)));

	const result = await db
		.select({
			...rest,
		})
		.from(customer)
		.where(eq(customer.id, id))
		.get();

	return c.json(result);
};
