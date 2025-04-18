import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
	and,
	asc,
	count as countFn,
	desc,
	eq,
	getTableColumns,
	like,
} from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import { customer, selectCustomerSchema } from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const listCustomerRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Customer'],
	request: {
		query: z.object({
			name: z.string().optional(),
			page: z.coerce.number().optional().default(1),
			limit: z.coerce.number().optional().default(25),
			sort: z.enum(['asc', 'desc']).optional().default('desc'),
			sortBy: z.enum(['createdAt', 'name']).optional().default('createdAt'),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				data: z.array(selectCustomerSchema),
				pagination: z.object({
					total: z.number(),
					page: z.number(),
					limit: z.number(),
					totalPages: z.number(),
				}),
			}),
			'List of customers with pagination',
		),
	},
});

export const listCustomerHandler: AppRouteHandler<
	typeof listCustomerRoute
> = async (c) => {
	const { name, page, limit, sort, sortBy } = c.req.valid('query');
	const user = c.var.user;
	const db = createDb(c.env);

	const offset = (page - 1) * limit;

	const filters = [eq(customer.userId, user.id)];

	if (name) {
		filters.push(like(customer.name, `%${name}%`));
	}

	const [{ count }] = await db
		.select({ count: countFn() })
		.from(customer)
		.where(and(...filters));

	const { userId, ...rest } = getTableColumns(customer);

	const results = await db
		.select({
			...rest,
		})
		.from(customer)
		.where(and(...filters))
		.orderBy(sort === 'asc' ? asc(customer[sortBy]) : desc(customer[sortBy]))
		.limit(limit)
		.offset(offset);

	return c.json({
		data: results,
		pagination: {
			total: count,
			page,
			limit,
			totalPages: Math.ceil(count / limit),
		},
	});
};
