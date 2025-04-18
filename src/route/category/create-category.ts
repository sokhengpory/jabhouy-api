import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import {
	category,
	insertCategorySchema,
	selectCategorySchema,
} from '~/db/schema/category.schema';
import type { AppRouteHandler } from '~/lib/type';

export const createCategoryRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Category'],
	request: {
		body: jsonContentRequired(insertCategorySchema, 'Create category'),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			selectCategorySchema,
			'Category created successfully',
		),
	},
});

export const createCategoryHandler: AppRouteHandler<
	typeof createCategoryRoute
> = async (c) => {
	const userId = c.var.user.id;
	const data = c.req.valid('json');
	const db = createDb(c.env);

	const [categories] = await db
		.insert(category)
		.values({ ...data, userId })
		.returning();

	return c.json(categories, HttpStatusCodes.CREATED);
};
