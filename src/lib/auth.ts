import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, username } from 'better-auth/plugins';
import { createDb } from '~/db';
import * as schema from '~/db/schema';
import { parseEnv } from '~/env';

const env = parseEnv(process.env);
const db = createDb(env);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema,
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	basePath: '/auth',
	plugins: [
		username(),
		openAPI({
			disableDefaultReference: process.env.NODE_ENV === 'production',
		}),
	],
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 4,
	},
});
