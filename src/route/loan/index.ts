import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppBindings } from '~/lib/type';
import { createLoanHandler, createLoanRoute } from './create-loan';
import { deleteLoanHandler, deleteLoanRoute } from './delete-loan';
import { getLoanHandler, getLoanRoute } from './get-loan';
import { listLoanHandler, listLoanRoute } from './list-loan';
import { updateLoanHandler, updateLoanRoute } from './update-loan';

export const loanRouter = new OpenAPIHono<AppBindings>();

loanRouter
	.openapi(listLoanRoute, listLoanHandler)
	.openapi(getLoanRoute, getLoanHandler)
	.openapi(createLoanRoute, createLoanHandler)
	.openapi(updateLoanRoute, updateLoanHandler)
	.openapi(deleteLoanRoute, deleteLoanHandler);
