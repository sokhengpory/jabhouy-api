import { db } from '@/db';
import { itemSchema, items } from '@/db/schema';
import type { AppRouteHandler } from '@/lib/type';
import { createRoute, z } from '@hono/zod-openapi';
import { and, count as countFn, eq, like } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';

export const itemsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Item'],
	request: {
		query: z.object({
			search: z.string().optional(),
			page: z.string().optional().default('1'),
			pageSize: z.string().optional().default('25'),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				items: z.array(itemSchema),
				pagination: z.object({
					total: z.number(),
					page: z.number(),
					pageSize: z.number(),
					totalPages: z.number(),
				}),
			}),
			'List items with pagination',
		),
	},
});

export const listItemHandler: AppRouteHandler<typeof itemsRoute> = async (
	c,
) => {
	const userId = c.var.user.id;
	const { search, page, pageSize } = c.req.valid('query');

	const pageNumber = Number.parseInt(page);
	const limit = Number.parseInt(pageSize);
	const offset = (pageNumber - 1) * limit;

	const filters = [eq(items.userId, userId)];

	if (search) {
		filters.push(like(items.name, `%${search}%`));
	}

	const [{ count }] = await db
		.select({ count: countFn() })
		.from(items)
		.where(and(...filters));

	const results = await db
		.select()
		.from(items)
		.where(and(...filters))
		.limit(limit)
		.offset(offset);

	return c.json(
		{
			items: results,
			pagination: {
				total: count,
				page: pageNumber,
				pageSize: limit,
				totalPages: Math.ceil(count / limit),
			},
		},
		HttpStatusCodes.OK,
	);
};
