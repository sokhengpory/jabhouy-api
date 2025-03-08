import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppBindings } from '~/lib/type';
import { createItemHandler, createItemRoute } from './create-item';
import { deleteItemHandler, deleteItemRoute } from './delete-item';
import { getItemHandler, getItemRoute } from './get-item';
import { listItemHandler, listItemRoute } from './list-item';
import { updateItemHandler, updateItemRoute } from './update-item';

export const itemRouter = new OpenAPIHono<AppBindings>();

itemRouter
	.openapi(listItemRoute, listItemHandler)
	.openapi(getItemRoute, getItemHandler)
	.openapi(createItemRoute, createItemHandler)
	.openapi(updateItemRoute, updateItemHandler)
	.openapi(deleteItemRoute, deleteItemHandler);
