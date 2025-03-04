import type { PinoLogger } from 'hono-pino';
import type { auth } from './auth';

export interface AppBindings {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
		logger: PinoLogger;
	};
}
