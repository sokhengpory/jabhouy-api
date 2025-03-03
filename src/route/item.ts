import { db } from '@/db';
import {
	insertItemSchema,
	itemSchema,
	items,
	updateItemSchema,
} from '@/db/schema';
import type { AppBindings } from '@/lib/type';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

export const itemRoute = new OpenAPIHono<AppBindings>().basePath('/items');

const itemsRoute = createRoute({
	method: 'get',
	path: '/',
	tags: ['Item'],
	responses: {
		[HttpStatusCodes.OK]: jsonContent(z.array(itemSchema), 'Get all items'),
	},
});

const itemByIdRoute = createRoute({
	method: 'get',
	path: '/{id}',
	tags: ['Item'],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(itemSchema, 'Get item by id'),
	},
});

const createItemRoute = createRoute({
	method: 'post',
	path: '/',
	tags: ['Item'],
	request: {
		body: jsonContentRequired(insertItemSchema, 'Create item'),
	},
	responses: {
		[HttpStatusCodes.CREATED]: jsonContent(
			insertItemSchema,
			'Created response',
		),
	},
});

const updateItemRoute = createRoute({
	method: 'put',
	path: '/{id}',
	tags: ['Item'],
	request: {
		body: jsonContentRequired(updateItemSchema, 'Update item'),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(updateItemSchema, 'Updated response'),
	},
});

const deleteItemRoute = createRoute({
	method: 'delete',
	path: '/{id}',
	tags: ['Item'],
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		[HttpStatusCodes.OK]: jsonContent(
			z.object({ message: z.string() }),
			'Delete item',
		),
	},
});

itemRoute.openapi(itemsRoute, async (c) => {
	const result = await db.select().from(items);
	return c.json(result, HttpStatusCodes.OK);
});

itemRoute.openapi(itemByIdRoute, async (c) => {
	const { id } = c.req.param();
	const [result] = await db
		.select()
		.from(items)
		.where(eq(items.id, Number(id)));

	return c.json(result, HttpStatusCodes.OK);
});

itemRoute.openapi(createItemRoute, async (c) => {
	const body = c.req.valid('json');
	const [result] = await db.insert(items).values(body).returning();

	return c.json(result, HttpStatusCodes.CREATED);
});

itemRoute.openapi(updateItemRoute, async (c) => {
	const { id } = c.req.param();
	const body = c.req.valid('json');
	const [result] = await db
		.update(items)
		.set(body)
		.where(eq(items.id, Number(id)))
		.returning();

	return c.json(result, HttpStatusCodes.OK);
});

itemRoute.openapi(deleteItemRoute, async (c) => {
	const { id } = c.req.param();
	const itemId = Number(id);

	const [deletedItem] = await db
		.delete(items)
		.where(eq(items.id, itemId))
		.returning();

	return c.json({ message: 'Item deleted successfully', item: deletedItem });
});
