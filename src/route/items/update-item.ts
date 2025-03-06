import { db } from '@/db';
import { items, updateItemSchema } from '@/db/schema';
import { notFoundSchema } from '@/lib/constants';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

export const updateItemRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Item'],
	request: {
		body: jsonContentRequired(updateItemSchema, 'Update item'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			updateItemSchema,
			'Updated item response',
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Item not found'),
	},
});

export const updateItemHandler: AppRouteHandler<
	typeof updateItemRoute
> = async (c) => {
	const { id } = c.req.param();
	const userId = c.var.user.id;
	const body = c.req.valid('json');

	const [result] = await db
		.update(items)
		.set(body)
		.where(and(eq(items.id, Number(id)), eq(items.userId, userId)))
		.returning();

	if (!result) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(result, HttpStatusCodes.OK);
};
