import { items } from '@/db/schema';

import { db } from '@/db';
import { category, insertItemSchema, selectItemSchema } from '@/db/schema';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute } from '@hono/zod-openapi';
import { eq, getTableColumns } from 'drizzle-orm';
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

	const { userId, categoryId, ...rest } = getTableColumns(items);

	const [created] = await db
		.insert(items)
		.values({ ...body, userId: user.id })
		.returning({
			id: items.id,
		});

	const [result] = await db
		.select({
			...rest,
			category: category.name,
		})
		.from(items)
		.leftJoin(category, eq(items.categoryId, category.id))
		.where(eq(items.id, created.id));

	return c.json(result, HttpStatusCodes.CREATED);
};
