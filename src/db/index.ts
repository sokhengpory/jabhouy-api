import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import type { Environment } from '~/env';

export function createDb(env: Environment) {
	const client = createClient({
		url: env.DATABASE_URL,
		authToken: env.DATABASE_AUTH_TOKEN,
	});

	return drizzle(client);
}
