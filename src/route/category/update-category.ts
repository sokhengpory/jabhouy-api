import { createRoute, z } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { IdParamsSchema } from 'stoker/openapi/schemas';
import { createDb } from '~/db';
import { category, selectCategorySchema } from '~/db/schema/category.schema';
import { notFoundSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

const updateCategorySchema = z.object({
	name: z.string().min(1).optional(),
});

export const updateCategoryRoute = createRoute({
	method: 'put',
	path: '/:id',
	tags: ['Category'],
	request: {
		params: IdParamsSchema,
		body: jsonContentRequired(updateCategorySchema, 'Update category'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			selectCategorySchema,
			'Category updated successfully',
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			notFoundSchema,
			'Category not found',
		),
	},
});

export const updateCategoryHandler: AppRouteHandler<
	typeof updateCategoryRoute
> = async (c) => {
	const { id } = c.req.valid('param');
	const body = c.req.valid('json');
	const user = c.var.user;
	const db = createDb(c.env);

	const [updated] = await db
		.update(category)
		.set(body)
		.where(and(eq(category.id, id), eq(category.userId, user.id)))
		.returning();

	if (!updated) {
		return c.json(
			{
				message: HttpStatusPhrases.NOT_FOUND,
			},
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json(updated, HttpStatusCodes.OK);
};
