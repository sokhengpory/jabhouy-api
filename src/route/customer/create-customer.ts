import { createRoute } from '@hono/zod-openapi';
import { getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import {
	customer,
	insertCustomerSchema,
	selectCustomerSchema,
} from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const createCustomerRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Customer'],
	request: {
		body: jsonContentRequired(insertCustomerSchema, 'Create customer'),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			selectCustomerSchema,
			'Created customer response',
		),
	},
});

export const createCustomerHandler: AppRouteHandler<
	typeof createCustomerRoute
> = async (c) => {
	const body = c.req.valid('json');
	const user = c.var.user;
	const db = createDb(c.env);

	const { userId, ...rest } = getTableColumns(customer);

	const [created] = await db
		.insert(customer)
		.values({ ...body, userId: user.id })
		.returning(rest);

	return c.json(created, HttpStatusCodes.CREATED);
};
