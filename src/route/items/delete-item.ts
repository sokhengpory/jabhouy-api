import { db } from '@/db';
import { items } from '@/db/schema';
import { notFoundSchema } from '@/lib/constants';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute, z } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

export const deleteItemRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Item'],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			createMessageObjectSchema(HttpStatusPhrases.OK),
			'Delete item',
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Item not found'),
	},
});

export const deleteItemHandler: AppRouteHandler<
	typeof deleteItemRoute
> = async (c) => {
	const { id } = c.req.param();
	const userId = c.var.user.id;
	const itemId = Number(id);

	const [deletedItem] = await db
		.delete(items)
		.where(and(eq(items.id, itemId), eq(items.userId, userId)))
		.returning();

	if (!deletedItem) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json({ message: HttpStatusPhrases.OK }, HttpStatusCodes.OK);
};
