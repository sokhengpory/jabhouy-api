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
import { db } from '~/db';
import { loan, selectLoanSchema } from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const listLoanRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Loan'],
	request: {
		query: z.object({
			name: z.string().optional(),
			page: z.coerce.number().optional().default(1),
			limit: z.coerce.number().optional().default(25),
			sort: z.enum(['asc', 'desc']).optional().default('desc'),
			sortBy: z
				.enum(['createdAt', 'name', 'amount'])
				.optional()
				.default('createdAt'),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({
				loans: z.array(selectLoanSchema),
				pagination: z.object({
					total: z.number(),
					page: z.number(),
					limit: z.number(),
					totalPages: z.number(),
				}),
			}),
			'List of loans with pagination',
		),
	},
});

export const listLoanHandler: AppRouteHandler<typeof listLoanRoute> = async (
	c,
) => {
	const { name, page, limit, sort, sortBy } = c.req.valid('query');
	const user = c.var.user;

	const { userId, ...rest } = getTableColumns(loan);

	const filters = [eq(loan.userId, user.id)];

	if (name) {
		filters.push(like(loan.name, `%${name}%`));
	}

	const offset = (page - 1) * limit;

	const [{ count }] = await db
		.select({ count: countFn() })
		.from(loan)
		.where(and(...filters));

	const results = await db
		.select({
			...rest,
		})
		.from(loan)
		.where(and(...filters))
		.orderBy(sort === 'asc' ? asc(loan[sortBy]) : desc(loan[sortBy]))
		.limit(limit)
		.offset(offset);

	return c.json({
		loans: results,
		pagination: {
			total: count,
			page,
			limit,
			totalPages: Math.ceil(count / limit),
		},
	});
};
