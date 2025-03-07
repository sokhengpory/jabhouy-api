import { db } from '@/db';
import { category } from '@/db/schema/category.schema';
import { notFoundSchema, okSchema } from '@/lib/constants';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { IdParamsSchema } from 'stoker/openapi/schemas';

export const deleteCategoryRoute = createRoute({
	method: 'delete',
	path: '/:id',
	tags: ['Category'],
	request: {
		params: IdParamsSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			okSchema,
			'Category deleted successfully',
		),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(
			notFoundSchema,
			'Category not found',
		),
	},
});

export const deleteCategoryHandler: AppRouteHandler<
	typeof deleteCategoryRoute
> = async (c) => {
	const { id } = c.req.valid('param');

	const [deletedCategory] = await db
		.delete(category)
		.where(eq(category.id, id))
		.returning();

	if (!deletedCategory) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	return c.json({ message: HttpStatusPhrases.OK }, HttpStatusCodes.OK);
};
