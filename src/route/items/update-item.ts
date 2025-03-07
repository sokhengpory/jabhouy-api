import { db } from '@/db';
import {
	category,
	items,
	selectItemSchema,
	updateItemSchema,
} from '@/db/schema';
import { notFoundSchema } from '@/lib/constants';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
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
			selectItemSchema,
			'Updated item response',
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Item not found'),
	},
});

export const updateItemHandler: AppRouteHandler<
	typeof updateItemRoute
> = async (c) => {
	const { id } = c.req.param();
	const user = c.var.user;
	const body = c.req.valid('json');

	const { userId, categoryId, ...rest } = getTableColumns(items);

	const [updated] = await db
		.update(items)
		.set(body)
		.where(and(eq(items.id, Number(id)), eq(items.userId, user.id)))
		.returning({
			id: items.id,
		});

	if (!updated) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	const [result] = await db
		.select({
			...rest,
			categoryName: category.name,
		})
		.from(items)
		.leftJoin(category, eq(items.categoryId, category.id))
		.where(eq(items.id, updated.id));

	return c.json(result, HttpStatusCodes.OK);
};
