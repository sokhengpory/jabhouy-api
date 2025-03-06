import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { pinoLogger } from 'hono-pino';
import pino from 'pino';
import pretty from 'pino-pretty';
import { notFound, onError } from 'stoker/middlewares';
import { auth } from './lib/auth';
import type { AppBindings } from './lib/type';
import { authMiddleware } from './middleware/auth';
import { itemHandler } from './route/items';

const openApiApp = new OpenAPIHono<AppBindings>();

openApiApp.use(authMiddleware);
openApiApp.use(
	pinoLogger({
		pino: pino(
			{
				level: process.env.LOG_LEVEL || 'info',
				formatters: {
					level(label) {
						return { level: label };
					},
				},
			},
			process.env.NODE_ENV === 'production' ? undefined : pretty(),
		),
	}),
);

openApiApp.notFound(notFound);
openApiApp.onError(onError);

openApiApp.on(['POST', 'GET'], '/auth/**', (c) => auth.handler(c.req.raw));

openApiApp.route('/', itemHandler);

openApiApp.doc('/docs', {
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'Jabhouy API',
	},
});

openApiApp.get(
	'/reference',
	apiReference({
		theme: 'kepler',
		layout: 'classic',
		defaultHttpClient: {
			targetKey: 'js',
			clientKey: 'fetch',
		},
		spec: {
			url: '/docs',
		},
	}),
);

serve(
	{
		fetch: openApiApp.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
