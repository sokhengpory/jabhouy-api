import { db } from '@/db';
import { itemSchema, items } from '@/db/schema';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

export const itemsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Item'],
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(itemSchema), 'Get all items'),
	},
});

export const listItemHandler: AppRouteHandler<typeof itemsRoute> = async (
	c,
) => {
	const userId = c.var.user.id;
	const result = await db.select().from(items).where(eq(items.userId, userId));
	return c.json(result, HttpStatusCodes.OK);
};
