import { createRoute, z } from '@hono/zod-openapi';
import { and, eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { db } from '~/db';
import {
	category,
	item,
	selectItemSchema,
	updateItemSchema,
} from '~/db/schema';
import { notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const updateItemRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Item'],
	request: {
		params: z.object({
			id: z.coerce.number(),
		}),
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
	const { id } = c.req.valid('param');
	const user = c.var.user;
	const body = c.req.valid('json');

	const { userId, categoryId, ...rest } = getTableColumns(item);

	const [updated] = await db
		.update(item)
		.set(body)
		.where(and(eq(item.id, id), eq(item.userId, user.id)))
		.returning({
			id: item.id,
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
			category: {
				id: category.id,
				name: category.name,
			},
		})
		.from(item)
		.leftJoin(category, eq(item.categoryId, category.id))
		.where(eq(item.id, updated.id));

	return c.json(result, HttpStatusCodes.OK);
};
