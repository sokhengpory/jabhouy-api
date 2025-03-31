import type { MiddlewareHandler } from 'hono';
import { auth } from '~/lib/auth';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
	if (c.req.path.startsWith('/auth') || c.req.path.startsWith('/privacy')) {
		return next();
	}

	if (
		c.req.path.startsWith('/reference') ||
		(c.req.path.startsWith('/docs') && process.env.NODE_ENV !== 'production')
	) {
		return next();
	}

	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session) {
		return c.json({ code: 'Unauthorized' }, 401);
	}

	c.set('user', session.user);
	c.set('session', session.session);

	return next();
};
