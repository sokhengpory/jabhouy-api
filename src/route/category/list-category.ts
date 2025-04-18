import { createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import { category, selectCategorySchema } from '~/db/schema/category.schema';
import type { AppRouteHandler } from '~/lib/type';

export const listCategoryRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Category'],
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectCategorySchema),
			'List all categories',
		),
	},
});

export const listCategoryHandler: AppRouteHandler<
	typeof listCategoryRoute
> = async (c) => {
	const user = c.var.user;
	const db = createDb(c.env);

	const results = await db
		.select()
		.from(category)
		.where(eq(category.userId, user.id));

	return c.json(results);
};
