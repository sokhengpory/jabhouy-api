import { db } from '@/db';
import { itemSchema, items } from '@/db/schema';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute, z } from '@hono/zod-openapi';
import { and, eq, like } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

export const itemsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Item'],
	request: {
		query: z.object({
			search: z.string().optional(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(itemSchema), 'List items'),
	},
});

export const listItemHandler: AppRouteHandler<typeof itemsRoute> = async (
	c,
) => {
	const userId = c.var.user.id;
	const { search } = c.req.valid('query');

	const result = await db
		.select()
		.from(items)
		.where(
			and(
				eq(items.userId, userId),
				search ? like(items.name, `%${search}%`) : undefined,
			),
		);

	return c.json(result, HttpStatusCodes.OK);
};
