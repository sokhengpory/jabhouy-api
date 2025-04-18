import { defineConfig } from 'drizzle-kit';
import { parseEnv } from '~/env';

const env = parseEnv(process.env);

export default defineConfig({
	out: './src/db/migrations',
	schema: './src/db/schema',
	dialect: 'turso',
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DATABASE_AUTH_TOKEN,
	},
});
