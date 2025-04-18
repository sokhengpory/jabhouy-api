import type { MiddlewareHandler } from 'hono';
import { auth } from '~/lib/auth';
import type { AppBindings } from '~/lib/type';

export const authMiddleware: MiddlewareHandler<AppBindings> = async (
	c,
	next,
) => {
	if (c.req.path.startsWith('/auth') || c.req.path.startsWith('/privacy')) {
		return next();
	}

	if (
		c.req.path.startsWith('/reference') ||
		(c.req.path.startsWith('/docs') && c.env.NODE_ENV !== 'production')
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
