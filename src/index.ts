import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { auth } from './lib/auth';
import { authMiddleware } from './middleware/auth';
import { itemRoute } from './route/item';

const openApiApp = new OpenAPIHono();

openApiApp.use('*', authMiddleware);

openApiApp.onError((err, c) => {
	console.log(err);
	return c.json({ error: err.message });
});

openApiApp.on(['POST', 'GET'], '/auth/**', (c) => auth.handler(c.req.raw));

openApiApp.route('/', itemRoute);

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
