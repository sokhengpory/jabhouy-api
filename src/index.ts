import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { etag } from 'hono/etag';
import { logger } from 'hono/logger';
import { notFound, onError } from 'stoker/middlewares';
import { auth } from './lib/auth';
import type { AppBindings } from './lib/type';
import { authMiddleware } from './middleware/auth';
import { categoryRouter } from './route/category';
import { customerRouter } from './route/customer';
import { itemRouter } from './route/items';
import { loanRouter } from './route/loan';
import { privacyRouter } from './route/privacy';
import { uploadRouter } from './route/upload';

const app = new OpenAPIHono<AppBindings>();

app.use(authMiddleware);
app.use(etag(), logger());

app.notFound(notFound);
app.onError(onError);

app.on(['POST', 'GET'], '/auth/**', (c) => auth.handler(c.req.raw));

app.route('/items', itemRouter);
app.route('/categories', categoryRouter);
app.route('/customers', customerRouter);
app.route('/loans', loanRouter);
app.route('/upload', uploadRouter);
app.route('/privacy', privacyRouter);

app.doc('/docs', {
	openapi: '3.0.0',
	info: {
		version: '1.0.0',
		title: 'Jabhouy API',
	},
});

app.get(
	'/reference',
	apiReference({
		theme: 'kepler',
		layout: 'classic',
		defaultHttpClient: {
			targetKey: 'js',
			clientKey: 'fetch',
		},
		url: '/docs',
	}),
);

export default app;
