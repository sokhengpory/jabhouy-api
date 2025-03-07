import { db } from '@/db';
import { category, items, selectItemSchema } from '@/db/schema';
import { notFoundSchema } from '@/lib/constants';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute, z } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';

export const itemRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Item'],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(selectItemSchema, 'Get item by id'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Item not found'),
	},
});

export const getItemHandler: AppRouteHandler<typeof itemRoute> = async (c) => {
	const { id } = c.req.param();
	const user = c.var.user;

	const { userId, categoryId, ...rest } = getTableColumns(items);

	const [result] = await db
		.select({
			...rest,
			category: category.name,
		})
		.from(items)
		.leftJoin(category, eq(items.categoryId, category.id))
		.where(and(eq(items.id, Number(id)), eq(items.userId, user.id)));

	if (!result) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(result, HttpStatusCodes.OK);
};
