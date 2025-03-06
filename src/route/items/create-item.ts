import { items } from '@/db/schema';

import { db } from '@/db';
import { insertItemSchema } from '@/db/schema';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

export const createItemRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Item'],
	request: {
		body: jsonContentRequired(insertItemSchema, 'Create item'),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			insertItemSchema,
			'Created item response',
		),
	},
});

export const createItemHandler: AppRouteHandler<
	typeof createItemRoute
> = async (c) => {
	const body = c.req.valid('json');
	const userId = c.var.user.id;
	const [result] = await db
		.insert(items)
		.values({ ...body, userId })
		.returning();

	return c.json(result, HttpStatusCodes.CREATED);
};
