import { createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import { and, eq, getTableColumns, like, or } from 'drizzle-orm';
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
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.array(selectLoanSchema),
			'List of loans',
		),
	},
});

export const listLoanHandler: AppRouteHandler<typeof listLoanRoute> = async (
	c,
) => {
	const { name } = c.req.valid('query');
	const user = c.var.user;

	const { userId, ...rest } = getTableColumns(loan);

	const filters = [eq(loan.userId, user.id)];

	if (name) {
		filters.push(like(loan.name, `%${name}%`));
	}

	const results = await db
		.select({
			...rest,
		})
		.from(loan)
		.where(and(...filters))
		.orderBy(loan.createdAt);

	return c.json(results);
};
