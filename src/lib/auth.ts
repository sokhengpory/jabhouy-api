import { db } from '@/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI, username } from 'better-auth/plugins';

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'sqlite',
	}),
	secret: process.env.BETTER_AUTH_SECRET,
	basePath: '/auth',
	plugins: [username(), openAPI()],
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 4,
	},
});
