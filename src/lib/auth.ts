import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, username } from 'better-auth/plugins';
import { db } from '~/db';
import * as schema from '~/db/schema';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema,
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	basePath: '/auth',
	plugins: [username(), openAPI()],
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 4,
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: 'none',
			secure: true,
			partitioned: true,
		},
	},
});
