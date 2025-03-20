import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppBindings } from '~/lib/type';
import { createCustomerHandler, createCustomerRoute } from './create-customer';
import { deleteCustomerHandler, deleteCustomerRoute } from './delete-customer';
import { getCustomerHandler, getCustomerRoute } from './get-customer';
import { listCustomerHandler, listCustomerRoute } from './list-customer';
import { updateCustomerHandler, updateCustomerRoute } from './update-customer';

export const customerRouter = new OpenAPIHono<AppBindings>();

customerRouter
	.openapi(listCustomerRoute, listCustomerHandler)
	.openapi(getCustomerRoute, getCustomerHandler)
	.openapi(createCustomerRoute, createCustomerHandler)
	.openapi(updateCustomerRoute, updateCustomerHandler)
	.openapi(deleteCustomerRoute, deleteCustomerHandler);
