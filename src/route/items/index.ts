import type { AppBindings } from '@/lib/type';
import { OpenAPIHono } from '@hono/zod-openapi';
import { createItemHandler, createItemRoute } from './create-item';
import { deleteItemHandler, deleteItemRoute } from './delete-item';
import { getItemHandler, itemRoute } from './get-item';
import { itemsRoute, listItemHandler } from './list-item';
import { updateItemHandler, updateItemRoute } from './update-item';

export const itemRouter = new OpenAPIHono<AppBindings>();

itemRouter
	.openapi(itemsRoute, listItemHandler)
	.openapi(itemRoute, getItemHandler)
	.openapi(createItemRoute, createItemHandler)
	.openapi(updateItemRoute, updateItemHandler)
	.openapi(deleteItemRoute, deleteItemHandler);
