import type { RouteConfig, RouteHandler } from '@hono/zod-openapi';
import type { PinoLogger } from 'hono-pino';
import type { auth } from './auth';

export interface AppBindings {
	Variables: {
		user: typeof auth.$Infer.Session.user;
		session: typeof auth.$Infer.Session.session;
		logger: PinoLogger;
	};
}

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
	R,
	AppBindings
>;
