import { createRoute, z } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';
import { db } from '~/db';
import { item } from '~/db/schema';
import { notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const deleteItemRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Item'],
	request: {
		params: z.object({
			id: z.coerce.number(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.OK),
			'Delete item response',
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Item not found'),
	},
});

export const deleteItemHandler: AppRouteHandler<
	typeof deleteItemRoute
> = async (c) => {
	const { id } = c.req.valid('param');
	const userId = c.var.user.id;

	const [deletedItem] = await db
		.delete(item)
		.where(and(eq(item.id, id), eq(item.userId, userId)))
		.returning();

	if (!deletedItem) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json({ message: HttpStatusPhrases.OK }, HttpStatusCodes.OK);
};
