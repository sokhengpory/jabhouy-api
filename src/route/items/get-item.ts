import { createRoute, z } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { db } from '~/db';
import { category, item, selectItemSchema } from '~/db/schema';
import { notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const getItemRoute = createRoute({
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

export const getItemHandler: AppRouteHandler<typeof getItemRoute> = async (
	c,
) => {
	const { id } = c.req.param();
	const user = c.var.user;

	const { userId, categoryId, ...rest } = getTableColumns(item);

	const [result] = await db
		.select({
			...rest,
			category: category.name,
		})
		.from(item)
		.leftJoin(category, eq(item.categoryId, category.id))
		.where(and(eq(item.id, Number(id)), eq(item.userId, user.id)));

	if (!result) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(result, HttpStatusCodes.OK);
};
