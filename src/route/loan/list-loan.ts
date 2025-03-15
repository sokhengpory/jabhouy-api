import { createRoute } from '@hono/zod-openapi';
import { eq, getTableColumns } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import { z } from 'zod';
import { db } from '~/db';
import { loan, selectLoanSchema } from '~/db/schema';
import type { AppRouteHandler } from '~/lib/type';

export const listLoanRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Loan'],
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
	const user = c.var.user;

	const { userId, ...rest } = getTableColumns(loan);

	const results = await db
		.select({
			...rest,
		})
		.from(loan)
		.where(eq(loan.userId, user.id))
		.orderBy(loan.createdAt);

	return c.json(results);
};
