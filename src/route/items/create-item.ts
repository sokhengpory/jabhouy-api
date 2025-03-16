import { createRoute } from '@hono/zod-openapi';
import { eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { db } from '~/db';
import {
	category,
	insertItemSchema,
	item,
	selectItemSchema,
} from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const createItemRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Item'],
	request: {
		body: jsonContentRequired(insertItemSchema, 'Create item'),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			selectItemSchema,
			'Created item response',
		),
	},
});

export const createItemHandler: AppRouteHandler<
	typeof createItemRoute
> = async (c) => {
	const body = c.req.valid('json');
	const user = c.var.user;

	const { userId, categoryId, ...rest } = getTableColumns(item);

	const [created] = await db
		.insert(item)
		.values({ ...body, userId: user.id })
		.returning({
			id: item.id,
		});

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
		.where(eq(item.id, created.id));

	return c.json(result, HttpStatusCodes.CREATED);
};
