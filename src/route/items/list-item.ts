import { createRoute, z } from '@hono/zod-openapi';
import { and, count as countFn, eq, getTableColumns, like } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { db } from '~/db';
import { category, item, selectItemSchema } from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const listItemRoute = createRoute({
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
				items: z.array(selectItemSchema),
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

export const listItemHandler: AppRouteHandler<typeof listItemRoute> = async (
	c,
) => {
	const user = c.var.user;
	const { search, page, pageSize } = c.req.valid('query');

	const pageNumber = Number.parseInt(page);
	const limit = Number.parseInt(pageSize);
	const offset = (pageNumber - 1) * limit;

	const filters = [eq(item.userId, user.id)];

	if (search) {
		filters.push(like(item.name, `%${search}%`));
	}

	const [{ count }] = await db
		.select({ count: countFn() })
		.from(item)
		.where(and(...filters));

	const { userId, categoryId, ...rest } = getTableColumns(item);

	const results = await db
		.select({
			...rest,
			category: category.name,
		})
		.from(item)
		.leftJoin(category, eq(item.categoryId, category.id))
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
