import { OpenAPIHono } from '@hono/zod-openapi';
import type { AppBindings } from '~/lib/type';
import { createCategoryHandler, createCategoryRoute } from './create-category';
import { deleteCategoryHandler, deleteCategoryRoute } from './delete-category';
import { listCategoryHandler, listCategoryRoute } from './list-category';
import { updateCategoryHandler, updateCategoryRoute } from './update-category';

export const categoryRouter = new OpenAPIHono<AppBindings>();

categoryRouter
	.openapi(listCategoryRoute, listCategoryHandler)
	.openapi(createCategoryRoute, createCategoryHandler)
	.openapi(updateCategoryRoute, updateCategoryHandler)
	.openapi(deleteCategoryRoute, deleteCategoryHandler);
