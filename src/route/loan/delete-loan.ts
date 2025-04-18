import { createRoute } from '@hono/zod-openapi';
import { and, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import * as HttpStatusPhrases from 'stoker/http-status-phrases';
import { jsonContent } from 'stoker/openapi/helpers';
import { createDb } from '~/db';
import { loan } from '~/db/schema';
import { idParamSchema, notFoundSchema, okSchema } from '~/lib/constants';
import type { AppRouteHandler } from '~/lib/type';

export const deleteLoanRoute = createRoute({
	method: 'delete',
	path: '/:id',
	tags: ['Loan'],
	request: {
		params: idParamSchema,
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(okSchema, 'Loan deleted successfully'),
		[HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'Loan not found'),
	},
});

export const deleteLoanHandler: AppRouteHandler<
	typeof deleteLoanRoute
> = async (c) => {
	const { id } = c.req.valid('param');
	const user = c.var.user;
	const db = createDb(c.env);
	const [existingLoan] = await db
		.select({ id: loan.id })
		.from(loan)
		.where(and(eq(loan.id, id), eq(loan.userId, user.id)));

	if (!existingLoan) {
		return c.json(
			{ message: HttpStatusPhrases.NOT_FOUND },
			HttpStatusCodes.NOT_FOUND,
		);
	}

	await db.delete(loan).where(and(eq(loan.id, id), eq(loan.userId, user.id)));

	return c.json({ message: HttpStatusPhrases.OK }, HttpStatusCodes.OK);
};
