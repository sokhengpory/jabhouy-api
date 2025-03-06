import type { AppBindings } from '@/lib/type';
import { OpenAPIHono } from '@hono/zod-openapi';
import { createItemHandler, createItemRoute } from './create-item';
import { deleteItemHandler, deleteItemRoute } from './delete-item';
import { getItemHandler, itemRoute } from './get-item';
import { itemsRoute, listItemHandler } from './list-item';
import { updateItemHandler, updateItemRoute } from './update-item';

export const itemHandler = new OpenAPIHono<AppBindings>().basePath('/items');

itemHandler.openapi(itemsRoute, listItemHandler);
itemHandler.openapi(itemRoute, getItemHandler);
itemHandler.openapi(createItemRoute, createItemHandler);
itemHandler.openapi(updateItemRoute, updateItemHandler);
itemHandler.openapi(deleteItemRoute, deleteItemHandler);
