import { createRoute, z } from '@hono/zod-openapi';
import {
	and,
	count as countFn,
	desc,
	eq,
	getTableColumns,
	like,
} from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { db } from '~/db';
import { category as categoryTable, item, selectItemSchema } from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const listItemRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Item'],
	request: {
		query: z.object({
			search: z.string().optional(),
			page: z.coerce.number().optional().default(1),
			limit: z.coerce.number().optional().default(25),
			category: z.coerce.number().optional(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				items: z.array(selectItemSchema),
				pagination: z.object({
					total: z.number(),
					page: z.number(),
					limit: z.number(),
					totalPages: z.number(),
				}),
			}),
			'List items with pagination',
		),
	},
});

export const listItemHandler: AppRouteHandler<typeof listItemRoute> = async (
	c,
) => {
	const user = c.var.user;
	const { search, page, limit, category } = c.req.valid('query');

	const offset = (page - 1) * limit;

	const filters = [eq(item.userId, user.id)];

	if (search) {
		filters.push(like(item.name, `%${search}%`));
	}

	if (category) {
		filters.push(eq(item.categoryId, category));
	}

	const [{ count }] = await db
		.select({ count: countFn() })
		.from(item)
		.where(and(...filters));

	const { userId, categoryId, ...rest } = getTableColumns(item);

	const results = await db
		.select({
			...rest,
			category: {
				id: categoryTable.id,
				name: categoryTable.name,
			},
		})
		.from(item)
		.leftJoin(categoryTable, eq(item.categoryId, categoryTable.id))
		.where(and(...filters))
		.limit(limit)
		.offset(offset)
		.orderBy(desc(item.createdAt));

	return c.json(
		{
			items: results,
			pagination: {
				total: count,
				page: page,
				limit: limit,
				totalPages: Math.ceil(count / limit),
			},
		},
		HttpStatusCodes.OK,
	);
};
